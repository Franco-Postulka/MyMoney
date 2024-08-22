from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class ExpenseCategory(models.Model):
    category = models.CharField(max_length=64)
    def __str__(self):
        return self.category

class PaymentMethod(models.Model):
    method = models.CharField(max_length=40)
    def __str__(self):
        return self.method

class Expense(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    amount = models.FloatField()
    date = models.DateField(default=timezone.now)
    #Optionals
    category = models.ForeignKey(ExpenseCategory,on_delete=models.SET_NULL,null=True,blank=True)
    note = models.CharField(max_length=125,blank=True)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL,null=True,blank=True)

class Income(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    amount = models.FloatField()
    date = models.DateField(default=timezone.now)
    #Optionals
    category = models.CharField(max_length=64,blank=True)
    note = models.CharField(max_length=125,blank=True)


