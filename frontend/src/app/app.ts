import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderService } from './order.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  message = signal('');
  isError = signal(false);
  loading = signal(false);
  nearbyMode = signal(false);

  // ค่าในช่องค้นหา (พิกัดตัวอย่างแถว ม.มหาสารคาม)
  lat = 16.2465;
  lng = 103.254;
  radius = 2;

  // รวมจำนวนกล่องทั้งหมดที่แสดงอยู่
  totalBoxes = computed(() => {
    let sum = 0;
    const list = this.orders();
    for (let i = 0; i < list.length; i++) {
      sum = sum + list[i].box_count;
    }
    return sum;
  });

  ngOnInit() {
    this.loadOrders();
  }

  private showOk(text: string) {
    this.isError.set(false);
    this.message.set(text);
  }

  private showError(err: any) {
    let text = 'เกิดข้อผิดพลาด ติดต่อ API ไม่ได้';
    if (err && err.error && err.error.error) {
      text = err.error.error;
    }
    this.loading.set(false);
    this.isError.set(true);
    this.message.set(text);
  }

  // แสดงออร์เดอร์ทั้งหมด
  loadOrders() {
    this.loading.set(true);
    this.nearbyMode.set(false);
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => this.showError(err)
    });
  }

  // จำลองออร์เดอร์ 20-30 รายการ
  simulate() {
    this.loading.set(true);
    this.orderService.simulate().subscribe({
      next: (res) => {
        this.showOk('จำลองออร์เดอร์สำเร็จ ' + res.count + ' รายการ');
        this.loadOrders();
      },
      error: (err) => this.showError(err)
    });
  }

  // ตัดสินใจว่าจะโหลดใหม่แบบไหน (ทั้งหมด หรือ ตามระยะ)
  private refresh() {
    if (this.nearbyMode()) {
      this.searchNearby();
    } else {
      this.loadOrders();
    }
  }

  // เพิ่ม/ลดจำนวนกล่อง (delta = +1 หรือ -1) ต้องอยู่ระหว่าง 1-3
  changeBox(order: Order, delta: number) {
    const newCount = order.box_count + delta;
    if (newCount < 1 || newCount > 3) {
      return;
    }
    this.orderService.updateBoxCount(order.order_id, newCount).subscribe({
      next: () => {
        this.showOk('แก้ไขออร์เดอร์ #' + order.order_id + ' เป็น ' + newCount + ' กล่อง');
        this.refresh();
      },
      error: (err) => this.showError(err)
    });
  }

  // ลบ 1 รายการ
  deleteOrder(order: Order) {
    if (!window.confirm('ลบออร์เดอร์ #' + order.order_id + ' ใช่ไหม?')) {
      return;
    }
    this.orderService.deleteOrder(order.order_id).subscribe({
      next: () => {
        this.showOk('ลบออร์เดอร์ #' + order.order_id + ' แล้ว');
        this.refresh();
      },
      error: (err) => this.showError(err)
    });
  }

  // ล้างทั้งหมด
  clearAll() {
    if (!window.confirm('ล้างรายการสั่งซื้อทั้งหมดใช่ไหม?')) {
      return;
    }
    this.orderService.clearAll().subscribe({
      next: (res) => {
        this.showOk('ล้างแล้ว ' + res.deleted + ' รายการ');
        this.loadOrders();
      },
      error: (err) => this.showError(err)
    });
  }

  // ค้นออร์เดอร์ในระยะที่กำหนด
  searchNearby() {
    this.loading.set(true);
    this.nearbyMode.set(true);
    this.orderService.getNearby(this.lat, this.lng, this.radius).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
        this.showOk('พบ ' + data.length + ' ออร์เดอร์ ในระยะ ' + this.radius + ' กม.');
      },
      error: (err) => this.showError(err)
    });
  }
}