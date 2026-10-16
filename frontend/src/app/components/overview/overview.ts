import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html'
})
export class OverviewComponent {
  orders = input<any[]>([]);
  customers = input<any[]>([]);
  loading = input<boolean>(false);
  dataLoaded = input<boolean>(false);
  todayOrders = input<number>(0);
  pendingOrders = input<number>(0);
  totalBoxes = input<number>(0);
  saving = input<boolean>(false);

  createOrder = output<void>();
  goToOrders = output<void>();
  simulate = output<void>();
  createCustomer = output<void>();
  editOrderAction = output<any>();

  customerName(order: any): string {
    return order.first_name ? `${order.first_name} ${order.last_name || ''}` : 'ไม่ระบุชื่อ';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }
}