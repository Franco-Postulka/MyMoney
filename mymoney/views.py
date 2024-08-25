#region Imports
from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse 
from . models import *
from django.db import IntegrityError
from django import forms 
from datetime import datetime
import calendar
#endregion 

#region login, logout, register
def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "mymoney/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "mymoney/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "mymoney/register.html", {
                "message": "Passwords must match."
            })
        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "mymoney/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "mymoney/register.html")
#endregion

#region Forms
class NewExpenseForm(forms.Form):
    amount =  forms.FloatField(required=True)
    date = forms.DateField(widget=forms.DateInput(
        attrs={
            'type': 'date',
        }
    ),required=True)
    category = forms.ModelChoiceField(queryset=ExpenseCategory.objects.all(),required=False)
    payment_method = forms.ModelChoiceField(queryset=PaymentMethod.objects.all(),required=False)
    note = forms.CharField(widget=forms.Textarea(attrs={"rows":"2"}),required=False,max_length=125)

class NewIncomeForm(forms.Form):
    amount =  forms.FloatField(required=True)
    date = forms.DateField(widget=forms.DateInput(
        attrs={
            'type': 'date',
        }
    ),required=True)
    category = forms.CharField(max_length=64)
    note = forms.CharField(widget=forms.Textarea(attrs={"rows":"2"}),required=False,max_length=125)
#endregion

def index(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            form = NewExpenseForm(request.POST)
            if form.is_valid():
                amount = form.cleaned_data["amount"]
                date = form.cleaned_data["date"]
                category = form.cleaned_data["category"]
                note = form.cleaned_data["note"]
                payment_method = form.cleaned_data["payment_method"]

                new_expense = Expense(
                    user = request.user,
                    amount = amount,
                    date = date,
                    category = category,
                    note = note,
                    payment_method = payment_method
                )
                new_expense.save()
                return HttpResponseRedirect(f"{reverse('index')}?section=list")
            else:
                return render(request,"mymoney/index.html?section=list",{
                    "epense_form": form,
                    "income_form": NewIncomeForm()
                })
        return render(request, "mymoney/index.html",{
            "expense_form": NewExpenseForm(),
            "income_form": NewIncomeForm()
    })
    else:
        return HttpResponseRedirect(reverse("login"))

#region only expense functions
def list(request):
    if request.user.is_authenticated:
        if request.method == "GET":
            expenses = Expense.objects.filter(user=request.user).order_by('-date')
            arr_expenses = []
            for expense in expenses:
                expense_dict = {
                    "id": expense.id,
                    "amount": expense.amount,
                    "date": expense.date,
                    "note": expense.note,
                    "category": str(expense.category) if expense.category else None,
                    "payment_method": str(expense.payment_method) if expense.payment_method else None
                }
                arr_expenses.append(expense_dict)
            return JsonResponse(arr_expenses,safe=False)
        else:
            return JsonResponse({
            "error": "GET request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))

def remove_expense(request, expense_id):
    if request.user.is_authenticated:
        if request.method == "DELETE":
            try:
                expense = Expense.objects.get(pk=expense_id)
                expense.delete()
                return JsonResponse({'ok':'Expense deleted correctly'})
            except Expense.DoesNotExist:
                return JsonResponse({'error':f'Expense with the id: {expense_id} does not exists'})
        else:
            return JsonResponse({
            "error": "DELETE request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))
#endregion

#region expense anlysis
def expense_per_category(request):
    if request.user.is_authenticated:
        if request.method == "GET":
            expenses = expenses_per_period(request)

            arr_categories = []
            already_a_dictionary_value = []
            for expense in expenses:
                if str(expense.category) not in already_a_dictionary_value:
                    already_a_dictionary_value.append(str(expense.category))
                    category_dict = {
                        "value": expense.amount,
                        "name": str(expense.category) if expense.category else "Not specified",
                    }
                    arr_categories.append(category_dict)
                else:
                    for dictionary in arr_categories:
                        if dictionary["name"] == str(expense.category):
                            dictionary["value"] += expense.amount
                            break

            return JsonResponse(arr_categories,safe=False)
        else:
            return JsonResponse({
            "error": "GET request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))

def expense_per_payment(request):
    if request.user.is_authenticated:
        if request.method == "GET":
            expenses = expenses_per_period(request)
            arr_payment = []
            already_a_dictionary_value = []
            for expense in expenses:
                if str(expense.payment_method) not in already_a_dictionary_value:
                    already_a_dictionary_value.append(str(expense.payment_method))
                    payment_dict = {
                        "value": expense.amount,
                        "name": str(expense.payment_method) if expense.payment_method else 'Not specified',
                    }
                    arr_payment.append(payment_dict)
                else:
                    for dictionary in arr_payment:
                        if dictionary["name"] == str(expense.payment_method):
                            dictionary["value"] += expense.amount
                            break
            return JsonResponse(arr_payment,safe=False)
        else:
            return JsonResponse({
            "error": "GET request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))

def expenses_per_period(request):
    year = int(request.GET.get('year'))
    month = int(request.GET.get('month'))
    first_day_date = datetime(year, month, 1).date()
    last_day = calendar.monthrange(year, month)
    last_day_date = datetime(year, month, last_day[1]).date()
    expenses = Expense.objects.filter(user=request.user, date__gte=first_day_date,date__lte=last_day_date).order_by('-date')
    return expenses

def get_months_and_years(request):
    if request.user.is_authenticated:
        if request.method == "GET":
            expenses = Expense.objects.filter(user=request.user).order_by('-date')
            arr_years_months = []
            already_a_year_in_dictionary = []
            for expense in expenses:
                date = expense.date
                if date.year not in already_a_year_in_dictionary:
                    dictionary_of_year = {
                        'year': date.year,
                        'months': [date.month]
                    }
                    arr_years_months.append(dictionary_of_year)
                    already_a_year_in_dictionary.append(date.year)
                else:
                    for dictionary in arr_years_months:
                        if dictionary['year'] == date.year:
                            if date.month not in dictionary['months']:
                                dictionary['months'].append(date.month)
            return JsonResponse(arr_years_months,safe=False)
        else:
            return JsonResponse({
            "error": "GET request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))
#endregion

#region income functions
def list_incomes(request):
    if request.user.is_authenticated:
        if request.method == "GET":
            incomes = Income.objects.filter(user=request.user).order_by('-date')
            arr_incomes = []
            for income in incomes:
                income_dict = {
                    "id": income.id,
                    "amount": income.amount,
                    "date": income.date,
                    "note": income.note,
                    "category": str(income.category) if income.category else None,
                }
                arr_incomes.append(income_dict)
            return JsonResponse(arr_incomes,safe=False)
        else:
            return JsonResponse({
            "error": "GET request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))

def remove_income(request, income_id):
    if request.user.is_authenticated:
        if request.method == "DELETE":
            try:
                income = Income.objects.get(pk=income_id)
                income.delete()
                return JsonResponse({'ok':'Income deleted correctly'})
            except Income.DoesNotExist:
                return JsonResponse({'error':f'Income with the id: {income_id} does not exists'})
        else:
            return JsonResponse({
            "error": "DELETE request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))

def add_income(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            form = NewIncomeForm(request.POST)
            if form.is_valid():
                amount = form.cleaned_data["amount"]
                date = form.cleaned_data["date"]
                category = form.cleaned_data["category"]
                note = form.cleaned_data["note"]

                new_income = Income(
                    user = request.user,
                    amount = amount,
                    date = date,
                    category = category,
                    note = note,
                )
                new_income.save()
                return HttpResponseRedirect(f"{reverse('index')}?section=list-income")
            else:
                return render(request,"mymoney/index.html",{
                    "epense_form": NewExpenseForm,
                    "income_form": form
                })
        else:
            return JsonResponse({
            "error": "POST request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))
    
#endregion 

def summary_graphics(request):
    if request.user.is_authenticated:
        if request.method == 'GET':
            today = timezone.now().date()
            initial_date = datetime(today.year -1 , today.month, 1).date()
            dictionary = {
                'dates': [],
                'expenses': [],
                'incomes': []
            }
            i = 0
            while i < 12:
                i +=1
                if initial_date.month < 12:
                    initial_date = datetime(initial_date.year, initial_date.month +1,initial_date.day).date()
                else:
                    initial_date = datetime(initial_date.year +1 , 1 ,initial_date.day).date()

                last_day = calendar.monthrange(initial_date.year, initial_date.month)
                last_day_date = datetime(initial_date.year, initial_date.month, last_day[1]).date()

                incomes_per_month = Income.objects.filter(user=request.user,date__gte=initial_date,date__lte=last_day_date)
                if not incomes_per_month:
                    dictionary["incomes"].append(0) #append incomes amount
                else:
                    amount_incomes = 0
                    for income in incomes_per_month:
                        amount_incomes += income.amount
                    dictionary["incomes"].append(amount_incomes) #appende incomes amount
                
                expenses_per_month = Expense.objects.filter(user=request.user,date__gte=initial_date,date__lte=last_day_date)
                if not expenses_per_month:
                    dictionary["expenses"].append(0)#append expeense per month 
                else:
                    amount_expenses = 0
                    for expense in expenses_per_month:
                        amount_expenses += expense.amount
                    dictionary["expenses"].append(amount_expenses)#append expeense per month 

                initial_date_str = str(initial_date)[:7]
                dictionary["dates"].append(initial_date_str) #Append a month 
            return JsonResponse(dictionary,safe=False)
        else:
            return JsonResponse({
                'error': 'GET request required.'
            },status=400)
    else:
        return HttpResponseRedirect(reverse("login"))