from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse 
from . models import *
from django.db import IntegrityError
from django import forms 
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


class NewTasksForm(forms.Form):
    amount =  forms.FloatField(label="Enter the amount",required=True)
    date = forms.DateField(widget=forms.DateInput(
        attrs={
            'class': 'form-control',
            'type': 'date'
        }
    ))
    category = forms.ModelChoiceField(label="Category...",required=False,queryset=ExpenseCategory.objects.all())
    note = forms.CharField(max_length=125,required=False)
    payment_method = forms.ModelChoiceField(label="Payment method...",queryset=PaymentMethod.objects.all())

def index(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            form = NewTasksForm(request.POST)
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
            else:
                return render(request,"mymoney/index.html",{
                    "form": form
                })
            
        return render(request, "mymoney/index.html",{
            "form": NewTasksForm()
    })
    else:
        return HttpResponseRedirect(reverse("login"))

