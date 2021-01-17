from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<int:month>/<int:year>", views.index_month, name="index_month"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("buckets/<int:user_id>", views.buckets, name="buckets"),
    path("buckets", views.save_bucket, name="save"),
    path("available_months", views.available_months, name="available_months"),

    # API Routes
    # path("emails", views.compose, name="compose"),
    # path("emails/<int:email_id>", views.email, name="email"),
    # path("emails/<str:mailbox>", views.mailbox, name="mailbox"),
]
