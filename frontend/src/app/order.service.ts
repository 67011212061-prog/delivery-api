import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  order_id: number;
  customer_id: number;
  order_date: string;
  box_count: number;
  deadline: string;
  status: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  lat: number;
  lng: number;
  address_note: string | null;
  distance_km?: number;
}

export interface SimulateResult {
  count: number;
  orders: Order[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = 'https://delivery-api-zeta.vercel.app';

  // 2.1 แสดงทั้งหมด
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl + '/orders');
  }

  // 2.1 จำลองออร์เดอร์ 20-30 รายการ
  simulate(): Observable<SimulateResult> {
    return this.http.post<SimulateResult>(this.baseUrl + '/orders/simulate', {});
  }

  // 2.1.3 แก้จำนวนกล่อง
  updateBoxCount(orderId: number, boxCount: number): Observable<Order> {
    return this.http.put<Order>(this.baseUrl + '/orders/' + orderId, { box_count: boxCount });
  }

  // 2.1.3 ลบ 1 รายการ
  deleteOrder(orderId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.baseUrl + '/orders/' + orderId);
  }

  // 2.2 ล้างทั้งหมด
  clearAll(): Observable<{ message: string; deleted: number }> {
    return this.http.delete<{ message: string; deleted: number }>(this.baseUrl + '/orders');
  }

  // 2.3 ค้นในระยะ (กม.)
  getNearby(lat: number, lng: number, radius: number): Observable<Order[]> {
    return this.http.get<Order[]>(
      this.baseUrl + '/orders/nearby?lat=' + lat + '&lng=' + lng + '&radius=' + radius
    );
  }
}