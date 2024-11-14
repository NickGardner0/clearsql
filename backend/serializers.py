from rest_framework import serializers
from .models import SavedQuery, QueryHistory
from connections.models import DatabaseConnection

class DatabaseConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConnection
        fields = ['id', 'name', 'host', 'port', 'database', 'username', 'db_type']

class SavedQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedQuery
        fields = ['id', 'name', 'query', 'created_at', 'updated_at']

class QueryHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QueryHistory
        fields = ['id', 'query', 'execution_time', 'status', 'error_message', 'executed_at'] 
