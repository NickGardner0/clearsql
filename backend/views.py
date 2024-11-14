from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection
import psycopg2
import time
from .models import QueryHistory, SavedQuery
from .serializers import QueryHistorySerializer, SavedQuerySerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def execute_query(request):
    query = request.data.get('query')
    if not query:
        return Response({'error': 'No query provided'}, status=400)

    start_time = time.time()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query)
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
            else:
                columns = []
                rows = []
            
            execution_time = time.time() - start_time
            
            # Save to query history
            QueryHistory.objects.create(
                user=request.user,
                query=query,
                execution_time=execution_time,
                status='success'
            )

            return Response({
                'columns': columns,
                'rows': rows,
                'execution_time': execution_time
            })

    except Exception as e:
        execution_time = time.time() - start_time
        # Save failed query to history
        QueryHistory.objects.create(
            user=request.user,
            query=query,
            execution_time=execution_time,
            status='error',
            error_message=str(e)
        )
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_table_structure(request):
    try:
        with connection.cursor() as cursor:
            # Get all tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            tables = cursor.fetchall()
            
            structure = {}
            for table in tables:
                table_name = table[0]
                # Get column information for each table
                cursor.execute("""
                    SELECT 
                        column_name, 
                        data_type, 
                        is_nullable,
                        column_default,
                        character_maximum_length
                    FROM information_schema.columns 
                    WHERE table_name = %s
                    ORDER BY ordinal_position
                """, (table_name,))
                columns = cursor.fetchall()
                structure[table_name] = [
                    {
                        'name': col[0],
                        'type': col[1],
                        'nullable': col[2] == 'YES',
                        'default': col[3],
                        'max_length': col[4]
                    } 
                    for col in columns
                ]
            
            return Response(structure)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def saved_queries(request):
    if request.method == 'GET':
        queries = SavedQuery.objects.filter(user=request.user)
        serializer = SavedQuerySerializer(queries, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SavedQuerySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def query_history(request):
    history = QueryHistory.objects.filter(user=request.user).order_by('-executed_at')[:100]  # Last 100 queries
    serializer = QueryHistorySerializer(history, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_connection(request):
    try:
        conn = psycopg2.connect(
            dbname=request.data.get('database'),
            user=request.data.get('username'),
            password=request.data.get('password'),
            host=request.data.get('host'),
            port=request.data.get('port')
        )
        conn.close()
        return Response({'message': 'Connection successful'})
    except Exception as e:
        return Response({'error': str(e)}, status=400) 
