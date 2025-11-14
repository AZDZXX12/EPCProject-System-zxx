# Generated manually for whitelist feature

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('selections', '0001_initial'),
    ]

    operations = [
        # 创建Whitelist模型
        migrations.CreateModel(
            name='Whitelist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(max_length=11, unique=True, verbose_name='手机号')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='添加时间')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='更新时间')),
                ('updated_by', models.CharField(blank=True, max_length=11, verbose_name='操作人')),
            ],
            options={
                'verbose_name': '白名单',
                'verbose_name_plural': '白名单',
                'db_table': 'phone_whitelist',
                'ordering': ['phone'],
            },
        ),
        # 给SelectionRecord添加phone字段
        migrations.AddField(
            model_name='selectionrecord',
            name='phone',
            field=models.CharField(blank=True, max_length=11, verbose_name='用户手机号'),
        ),
    ]

