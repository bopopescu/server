# Generated by Django 2.0.1 on 2018-01-21 23:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0005_slavestatus_dummy'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='slavestatus',
            name='dummy',
        ),
    ]