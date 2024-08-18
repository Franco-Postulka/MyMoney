from django.urls import path
from . import views

urlpatterns = [
    path('',views.index,name='index'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    #apis
    path("list/",views.list,name="list"),
    path("remove/<int:expense_id>",views.remove_expense,name="remov_expense"),
    path("expercategory/",views.expense_per_category, name="category_expense"),
]