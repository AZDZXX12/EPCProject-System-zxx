from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = '加载电缆初始数据'

    def handle(self, *args, **options):
        self.stdout.write('开始加载电缆规格数据...')
        
        try:
            call_command('loaddata', 'cables/fixtures/initial_data.json')
            self.stdout.write(
                self.style.SUCCESS('成功加载电缆规格数据')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'加载数据失败: {str(e)}')
            )

