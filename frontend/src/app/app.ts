import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import ให้ตรงกับชื่อไฟล์จริงที่ Angular CLI สร้าง (ไม่มี .component)
import { OverviewComponent } from './components/overview/overview';
import { OrdersComponent } from './components/orders/orders';
import { CustomersComponent } from './components/customers/customers';
import { ApiService } from './api.service';

export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  address_note?: string;
  lat: number;
  lng: number;
}

export interface Order {
  order_id: number;
  customer_id: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  box_count: number;
  status: string;
  order_date: string;
  deadline?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OverviewComponent,
    OrdersComponent,
    CustomersComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private api = inject(ApiService);

  page = signal<'overview' | 'orders' | 'customers'>('overview');
  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  loading = signal<boolean>(false);
  dataLoaded = signal<boolean>(false);
  saving = signal<boolean>(false);
  apiConnected = signal<boolean>(true);
  error = signal<string>('');
  notice = signal<string>('');

  today = new Date();

  // Modals state
  customerModalOpen = signal<boolean>(false);
  editingCustomerId = signal<number | null>(null);
  customerForm = signal<any>({
    first_name: '',
    last_name: '',
    phone: '',
    lat: 16.2443,
    lng: 103.2504,
    address_note: ''
  });

  orderModalOpen = signal<boolean>(false);
  editingOrderId = signal<number | null>(null);
  orderForm = signal<any>({
    customer_id: null,
    box_count: 1
  });

  // Computed metrics
  get todayOrders(): number {
    return this.orders().length;
  }

  get pendingOrders(): number {
    return this.orders().filter(o => o.status === 'pending').length;
  }

  get totalBoxes(): number {
    return this.orders().reduce((sum, o) => sum + (Number(o.box_count) || 0), 0);
  }

  ngOnInit() {
    this.loadAllData();
  }

  setPage(p: 'overview' | 'orders' | 'customers') {
    this.page.set(p);
  }

  loadAllData() {
    this.loading.set(true);
    this.api.getCustomers().subscribe({
      next: (custs: any) => { 
        this.customers.set(custs || []);
        this.api.getOrders().subscribe({
          next: (ords: any) => {
            this.orders.set(ords || []);
            this.dataLoaded.set(true);
            this.apiConnected.set(true);
            this.loading.set(false);
          },
          error: (err: any) => {
            this.apiConnected.set(false);
            this.loading.set(false);
          }
        });
      },
      error: (err: any) => {
        this.apiConnected.set(false);
        this.loading.set(false);
      }
    });
  }

  formatDate(d: any): string {
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date.getTime()) ? String(d) : date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Customer Management
  openNewCustomer() {
    this.editingCustomerId.set(null);
    this.customerForm.set({
      first_name: '',
      last_name: '',
      phone: '',
      lat: 16.2443,
      lng: 103.2504,
      address_note: ''
    });
    this.customerModalOpen.set(true);
  }

  editCustomer(c: Customer) {
    this.editingCustomerId.set(c.customer_id);
    this.customerForm.set({ ...c });
    this.customerModalOpen.set(true);
  }

  updateCustomerForm(key: string, val: any) {
    this.customerForm.update(f => ({ ...f, [key]: val }));
  }

  saveCustomer() {
    this.saving.set(true);
    const form = this.customerForm();
    const id = this.editingCustomerId();

    const request$ = id
      ? this.api.updateCustomer(id, form)
      : this.api.createCustomer(form);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.customerModalOpen.set(false);
        this.notice.set(id ? 'อัปเดตข้อมูลลูกค้าสำเร็จ' : 'เพิ่มลูกค้าเรียบร้อยแล้ว');
        this.loadAllData();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err.message || 'บันทึกข้อมูลลูกค้าไม่สำเร็จ');
      }
    });
  }

  deleteCustomer(c: Customer) {
    if (!confirm(`ต้องการลบลูกค้า "${c.first_name} ${c.last_name}" ใช่หรือไม่?`)) return;
    this.api.deleteCustomer(c.customer_id).subscribe({
      next: () => {
        this.notice.set('ลบข้อมูลลูกค้าเรียบร้อยแล้ว');
        this.loadAllData();
      },
      error: (err: any) => this.error.set(err.message || 'ลบข้อมูลไม่สำเร็จ')
    });
  }

  // Order Management
  openNewOrder() {
    if (!this.customers().length) {
      this.error.set('กรุณาเพิ่มลูกค้าก่อนสร้างออร์เดอร์');
      return;
    }
    this.editingOrderId.set(null);
    this.orderForm.set({
      customer_id: this.customers()[0].customer_id,
      box_count: 1
    });
    this.orderModalOpen.set(true);
  }

  editOrder(o: Order) {
    this.editingOrderId.set(o.order_id);
    this.orderForm.set({
      customer_id: o.customer_id,
      box_count: o.box_count
    });
    this.orderModalOpen.set(true);
  }

  updateOrderForm(key: string, val: any) {
    this.orderForm.update(f => ({ ...f, [key]: val }));
  }

  saveOrder() {
    this.saving.set(true);
    const form = this.orderForm();
    const id = this.editingOrderId();

    const request$ = id
      ? this.api.updateOrder(id, form)
      : this.api.createOrder(form);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.orderModalOpen.set(false);
        this.notice.set(id ? 'แก้ไขออร์เดอร์สำเร็จ' : 'สร้างออร์เดอร์เรียบร้อยแล้ว');
        this.loadAllData();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err.message || 'บันทึกออร์เดอร์ไม่สำเร็จ');
      }
    });
  }

  deleteOrder(o: Order) {
    if (!confirm(`ต้องการลบออร์เดอร์ #${o.order_id} ใช่หรือไม่?`)) return;
    this.api.deleteOrder(o.order_id).subscribe({
      next: () => {
        this.notice.set('ลบออร์เดอร์เรียบร้อยแล้ว');
        this.loadAllData();
      },
      error: (err: any) => this.error.set(err.message || 'ลบออร์เดอร์ไม่สำเร็จ')
    });
  }

  simulateOrders() {
    if (!this.customers().length) return;
    this.saving.set(true);
    const randomCustomer = this.customers()[Math.floor(Math.random() * this.customers().length)];
    const randomBoxes = Math.floor(Math.random() * 3) + 1;

    this.api.createOrder({
      customer_id: randomCustomer.customer_id,
      box_count: randomBoxes
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notice.set('สร้างออร์เดอร์ตัวอย่างเรียบร้อยแล้ว');
        this.loadAllData();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err.message || 'สร้างออร์เดอร์ตัวอย่างไม่สำเร็จ');
      }
    });
  }

  clearOrders() {
    if (!confirm('ยืนยันที่จะลบออร์เดอร์ทั้งหมดในระบบ?')) return;
    this.api.clearOrders().subscribe({
      next: () => {
        this.notice.set('ล้างออร์เดอร์ทั้งหมดเรียบร้อยแล้ว');
        this.loadAllData();
      },
      error: (err: any) => this.error.set(err.message || 'ไม่สามารถล้างออร์เดอร์ได้')
    });
  }
}