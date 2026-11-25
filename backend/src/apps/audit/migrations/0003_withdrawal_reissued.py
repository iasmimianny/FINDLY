from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("audit", "0002_auditevent_collection_point_alter_auditevent_action")]

    operations = [
        migrations.AlterField(
            model_name="auditevent",
            name="action",
            field=models.CharField(
                "ação realizada",
                max_length=30,
                db_index=True,
                choices=[
                    ("CREATED", "Item cadastrado"),
                    ("STATUS_CHANGED", "Status alterado"),
                    ("CUSTODY_TRANSFERRED", "Custódia transferida"),
                    ("CLAIM_APPROVED", "Reivindicação aprovada"),
                    ("CLAIM_REJECTED", "Reivindicação recusada"),
                    ("CLAIM_CANCELLED", "Reivindicação cancelada"),
                    ("WITHDRAWAL_CONFIRMED", "Retirada confirmada"),
                    ("WITHDRAWAL_REISSUED", "Autorização de retirada reemitida"),
                ],
            ),
        )
    ]
