from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from apps.accounts.models import User


class Command(BaseCommand):
    help = "Create the first admin user (role=admin). Usage: python manage.py create_admin --email a@x.com --password secret"

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument("--username", default="admin")

    def handle(self, *args, **options):
        if User.objects.filter(email=options["email"]).exists():
            self.stdout.write(self.style.WARNING("A user with that email already exists."))
            return
        User.objects.create(
            username=options["username"],
            email=options["email"],
            password=make_password(options["password"]),
            role=User.Role.ADMIN,
            is_active=True,
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Admin user {options['email']} created."))
