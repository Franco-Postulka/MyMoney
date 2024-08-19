from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse 
from . models import *
from django.db import IntegrityError
from django import forms 
from django.core import serializers
import json
from datetime import datetime
import calendar
# Create your views here.



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
                return HttpResponseRedirect(reverse('index'))
            else:
                return render(request,"mymoney/index.html",{
                    "form": form
                })
            
        return render(request, "mymoney/index.html",{
            "form": NewExpenseForm()
    })
    else:
        return HttpResponseRedirect(reverse("login"))
    

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
            "error": "GET or PUT request required."
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
    

def expense_per_category(request):
    # data: [
    #         { value: 1048, name: 'Search Engine' },
    #         { value: 735, name: 'Direct' },
    #         { value: 580, name: 'Email' },
    #         { value: 484, name: 'Union Ads' },
    #         { value: 300, name: 'Video Ads' }
    #     ]
    if request.user.is_authenticated:
        if request.method == "GET":
            date = timezone.now()
            first_day_of_month = datetime(date.year, date.month, 1).date()
            expenses = Expense.objects.filter(user=request.user, date__gte=first_day_of_month).order_by('-date')
            arr_categories = []
            already_a_dictionary_value = []
            find_months(request)
            for expense in expenses:
                if str(expense.category) not in already_a_dictionary_value:
                    already_a_dictionary_value.append(str(expense.category))
                    category_dict = {
                        "value": expense.amount,
                        "name": str(expense.category) if expense.category else None,
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
            "error": "GET or PUT request required."
        }, status=400)
    else:
        return HttpResponseRedirect(reverse("login"))
    
def find_months(request):
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

    print(arr_years_months)
    # date = timezone.now()
    # first_day_date = datetime(date.year, date.month, 1).date()
    # last_day = calendar.monthrange(date.year, date.month)
    # last_day_date = datetime(date.year, date.month, last_day[1]).date()
    # print(first_day_date)
    # print(last_day_date)