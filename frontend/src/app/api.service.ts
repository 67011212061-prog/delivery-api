import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  lat: number;
  lng: number;
  address_note: string | null;
}

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
}

export interface CustomerPayload {
  first_name: string;
  last_name: string;
  phone: string | null;
  lat: number;
  lng: number;
  address_note: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://delivery-api-zeta.vercel.app';

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
  }

  createCustomer(payload: CustomerPayload): Observable<Customer> {
    return this.http.post<Customer>(`${this.baseUrl}/customers`, payload);
  }

  updateCustomer(id: number, payload: CustomerPayload): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/customers/${id}`, payload);
  }

  deleteCustomer(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/customers/${id}`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  createOrder(payload: { customer_id: number; box_count: number }): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, payload);
  }

  updateOrder(id: number, box_count: number): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}`, { box_count });
  }

  deleteOrder(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/orders/${id}`);
  }

  simulateOrders(count: number): Observable<{ count: number; orders: Order[] }> {
    return this.http.post<{ count: number; orders: Order[] }>(`${this.baseUrl}/orders/simulate`, { count });
  }

  clearOrders(): Observable<{ message: string; deleted: number }> {
    return this.http.delete<{ message: string; deleted: number }>(`${this.baseUrl}/orders`);
  }
}