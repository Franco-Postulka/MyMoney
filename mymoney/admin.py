from django.contrib import admin
from . models import *

# Register your models here.

admin.site.register(ExpenseCategory)
admin.site.register(PaymentMethod)
admin.site.register(Expense)
admin.site.register(Income)

