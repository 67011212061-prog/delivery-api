import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Order {
  order_id: number;
  customer_id: number;
  first_name?: string;
  last_name?: string;
  box_count: number;
  status: string;
  order_date?: string;
  deadline?: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html'
})
export class OverviewComponent {
  orders = input<Order[]>([]);

  createOrder = output<void>();
  editOrderAction = output<any>();
}