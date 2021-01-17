from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    pass

class Month(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="month")
    month = models.IntegerField(validators=[MinValueValidator(1),MaxValueValidator(12)])
    year = models.IntegerField()
    buckets = models.ManyToManyField("Bucket", related_name="month")
    income = models.IntegerField(default=0)
    def serialize(self, safe=False):
        return {
            "month_id": self.id,
            "month": self.month,
            "year": self.year,
            "income": self.income,
            "user": [self.user.id, self.user.username, self.user.first_name],
            "buckets": [bucket.serialize() for bucket in self.buckets.all()],
        }
    def __str__(self):
        return f"{self.month} {self.year}, {self.user}"

class Bucket(models.Model):
    name = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    amount = models.IntegerField(default=0)
    def serialize(self, safe=False):
        return {
            "name": self.name,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "amount": self.amount,
            "bucket_id": self.id,
        }
    def __str__(self):
        return f"{self.name}: {self.amount}"

