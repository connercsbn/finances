import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from datetime import date

from .models import User, Bucket, Month


def index(request):

    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "finance_site/inbox.html", {
            "month": date.today().month,
            "year": date.today().year
        })

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))
# index specific to particular month/year 
def index_month(request, year, month):

    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "finance_site/inbox.html", {
            "month": month,
            "year": year
        })

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))



@login_required
def save_bucket(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    buckets = [bucket for bucket in data.get("buckets")]
    print("buckets: ")
    print(buckets)
    month, year = data.get("month"), data.get("year")
    # delete month if it already exists in the database
    newBucketList = []
    if Month.objects.filter(user=request.user, month=month, year=year).count() > 0:
        print('there is already a month. deleting...')
        Month.objects.get(user=request.user, month=month, year=year).delete()
    # set incomeAmount to 0 in case we don't receive an income, in order to initialize the Month with a 0 income
    incomeAmount = 0
    for bucket in buckets:
        print("bucket: ")
        print(bucket)
        # if bucket exists, delete
        if bucket['name'] == 'Income':
            incomeAmount = int(bucket['amount'])
            print('income amount is: ' + str(incomeAmount))
        else:
            name, amount = bucket['name'], bucket['amount']
            newBucket = Bucket(name=name, amount=amount)
            newBucket.save()
            print("new bucket is: " + newBucket.name)
            newBucketList.append(newBucket.id)
    print(newBucketList)
    newMonth = Month(user=request.user,month=month,year=year,income=incomeAmount)
    newMonth.save()
    print(newMonth.serialize())
    print(Month.objects.all())
    for bucketID in newBucketList:
        newMonth.buckets.add(Bucket.objects.get(id=bucketID))
    newMonth.save()
    print(newMonth)
    return JsonResponse({"message": "Bucket saved successfully"}, status=201)
    # emails = [email.strip() for email in data.get("recipients").split(",")]
    # if emails == [""]:
    #     return JsonResponse({
    #         "error": "At least one recipient required."
    #     }, status=400)

    # # Convert email addresses to users
    # recipients = []
    # for email in emails:
    #     try:
    #         user = User.objects.get(email=email)
    #         recipients.append(user)
    #     except User.DoesNotExist:
    #         return JsonResponse({
    #             "error": f"User with email {email} does not exist."
    #         }, status=400)

    # # Get contents of email
    # subject = data.get("subject", "")
    # body = data.get("body", "")

    # # Create one email for each recipient, plus sender
    # users = set()
    # users.add(request.user)
    # users.update(recipients)
    # for user in users:
    #     email = Email(
    #         user=user,
    #         sender=request.user,
    #         subject=subject,
    #         body=body,
    #         read=user == request.user
    #     )
    #     email.save()
    #     for recipient in recipients:
    #         email.recipients.add(recipient)
    #     email.save()


# @login_required
# def mailbox(request, mailbox):

#     # Filter emails returned based on mailbox
#     if mailbox == "inbox":
#         emails = Email.objects.filter(
#             user=request.user, recipients=request.user, archived=False
#         )
#     elif mailbox == "sent":
#         emails = Email.objects.filter(
#             user=request.user, sender=request.user
#         )
#     elif mailbox == "archive":
#         emails = Email.objects.filter(
#             user=request.user, recipients=request.user, archived=True
#         )
#     else:
#         return JsonResponse({"error": "Invalid mailbox."}, status=400)

#     # Return emails in reverse chronologial order
#     emails = emails.order_by("-timestamp").all()
#     return JsonResponse([email.serialize() for email in emails], safe=False)


# @csrf_exempt
# @login_required
# def email(request, email_id):

#     # Query for requested email
#     try:
#         email = Email.objects.get(user=request.user, pk=email_id)
#     except Email.DoesNotExist:
#         return JsonResponse({"error": "Email not found."}, status=404)

#     # Return email contents
#     if request.method == "GET":
#         return JsonResponse(email.serialize())

#     # Update whether email is read or should be archived
#     elif request.method == "PUT":
#         data = json.loads(request.body)
#         if data.get("read") is not None:
#             email.read = data["read"]
#         if data.get("archived") is not None:
#             email.archived = data["archived"]
#         email.save()
#         return HttpResponse(status=204)

#     # Email must be via GET or PUT
#     else:
#         return JsonResponse({
#             "error": "GET or PUT request required."
#         }, status=400)

@login_required
def buckets(request, user_id):
    if request.user.id != user_id:
        return HttpResponseRedirect(reverse("login"))
    months = Month.objects.filter(user=request.user)
    if 'month' and 'year' in request.GET:
        months = months.filter(month=request.GET["month"], year=request.GET["year"])
    else:
        months = months.filter(month=date.today().month, year=date.today().year)
    if len(months) < 1:
        return JsonResponse(["Empty"] + [(month.month, month.year) for month in Month.objects.filter(user=request.user)], safe=False)
    return JsonResponse([month.serialize() for month in months], safe=False)

@login_required
def available_months(request):
    return JsonResponse([(month.month, month.year) for month in Month.objects.filter(user=request.user)], safe=False)
    

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "finance_site/login.html", {
                "message": "Invalid email and/or password."
            })
    else:
        return render(request, "finance_site/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "finance_site/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(email, email, password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "finance_site/register.html", {
                "message": "Email address already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "finance_site/register.html")
