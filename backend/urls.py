rom django.contrib import admin
from django.urls import path, include
from queries import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/execute-query/', views.execute_query),
    path('api/table-structure/', views.get_table_structure),
    path('api/saved-queries/', views.saved_queries),
    path('api/query-history/', views.query_history),
] 
