# Generated by Django 2.0.1 on 2018-01-21 22:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0002_auto_20180121_2019'),
    ]

    operations = [
        migrations.AddField(
            model_name='programstatus',
            name='dummy',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]