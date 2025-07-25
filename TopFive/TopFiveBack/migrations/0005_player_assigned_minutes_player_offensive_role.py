# Generated by Django 5.2.3 on 2025-07-02 07:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TopFiveBack', '0004_player_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='assigned_minutes',
            field=models.PositiveIntegerField(default=0, verbose_name='Assigned Minutes'),
        ),
        migrations.AddField(
            model_name='player',
            name='offensive_role',
            field=models.CharField(choices=[('PRIMARY', 'First Option'), ('SECONDARY', 'Second Option'), ('ROLE', 'Role Player'), ('DND', "Don't Shoot")], default='ROLE', max_length=10, verbose_name='Offensive Role'),
        ),
    ]
