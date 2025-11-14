# Generated migration file

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CableSpec',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=50, verbose_name='型号')),
                ('core_count', models.IntegerField(verbose_name='芯数')),
                ('cross_section', models.DecimalField(decimal_places=2, max_digits=6, verbose_name='截面积(mm²)')),
                ('current_rating', models.DecimalField(decimal_places=2, max_digits=7, verbose_name='载流量(A)')),
                ('rated_voltage', models.IntegerField(verbose_name='额定电压(V)')),
                ('max_temp', models.IntegerField(verbose_name='最高工作温度(℃)')),
                ('insulation_material', models.CharField(default='XLPE', max_length=50, verbose_name='绝缘材料')),
                ('shield_type', models.CharField(default='copper', max_length=20, verbose_name='屏蔽类型')),
                ('price_per_meter', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='单价(元/米)')),
                ('voltage_drop_coef', models.DecimalField(decimal_places=6, default=0.727, max_digits=10, verbose_name='电压降系数(mV/(A·km))')),
            ],
            options={
                'verbose_name': '电缆规格',
                'verbose_name_plural': '电缆规格',
                'db_table': 'cable_specs',
                'ordering': ['cross_section'],
            },
        ),
    ]

