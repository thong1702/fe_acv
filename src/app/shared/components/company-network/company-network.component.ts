import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NetworkLocation {
  id: number;
  type: string;
  city: string;
  name: string;
  address: string;
  phone: string;
}

@Component({
  selector: 'app-company-network',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-network.component.html'
})
export class CompanyNetworkComponent {
  networkLocations: NetworkLocation[] = [
    {
      id: 1,
      type: 'Trụ Sở & VPĐD',
      city: 'Hà Nội',
      name: 'Văn Phòng Đại Diện Hà Nội',
      address: 'Nhà số 5, ngách 172/1 đường Nguyễn Tuân, phường Thanh Xuân, Thành phố Hà Nội.',
      phone: '0985 103 666'
    },
    {
      id: 2,
      type: 'Chi Nhánh',
      city: 'TP. Hồ Chí Minh',
      name: 'Chi Nhánh Miền Nam',
      address: '75 đường D3, Khu dân cư Mega Ruby Khang Điền, phường Cát Lái, Thành phố Hồ Chí Minh.',
      phone: '0904 398 868'
    },
    {
      id: 3,
      type: 'Chi Nhánh',
      city: 'Nghệ An',
      name: 'Chi Nhánh Miền Trung',
      address: 'Số 5, ngõ 86 đường Hà Huy Tập, phường Vinh Phú, tỉnh Nghệ An.',
      phone: '0904 398 868'
    },
    {
      id: 4,
      type: 'Văn Phòng Đại Diện',
      city: 'Điện Biên',
      name: 'Văn Phòng Đại Diện Điện Biên',
      address: 'Đội 4B, phường Mường Thanh, tỉnh Điện Biên.',
      phone: '0904 398 868'
    },
    {
      id: 5,
      type: 'Văn Phòng Đại Diện',
      city: 'Lào Cai',
      name: 'Văn Phòng Đại Diện Lào Cai',
      address: '082 Ngô Văn Sở, phường Lào Cai, tỉnh Lào Cai.',
      phone: '0904 398 868'
    },
    {
      id: 6,
      type: 'Văn Phòng Đại Diện',
      city: 'Quảng Ngãi',
      name: 'Văn Phòng Đại Diện Quảng Ngãi',
      address: '199/4 Lê Lợi, phường Chánh Lộ, tỉnh Quảng Ngãi.',
      phone: '0904 398 868'
    },
    {
      id: 7,
      type: 'Văn Phòng Đại Diện',
      city: 'Phú Thọ',
      name: 'Văn Phòng Đại Diện Vĩnh Phúc (Phú Thọ)',
      address: 'Số 104, phố Trần Quang Sơn, Khu đô thị Hùng Vương – Tiên Châu, phường Phúc Yên, tỉnh Phú Thọ.',
      phone: '0904 398 868'
    }
  ];

  selectedNetworkIndex = 0;

  selectLocation(index: any): void {
    this.selectedNetworkIndex = Number(index);
  }

  prevLocation(): void {
    if (this.selectedNetworkIndex > 0) {
      this.selectedNetworkIndex--;
    } else {
      this.selectedNetworkIndex = this.networkLocations.length - 1;
    }
  }

  nextLocation(): void {
    if (this.selectedNetworkIndex < this.networkLocations.length - 1) {
      this.selectedNetworkIndex++;
    } else {
      this.selectedNetworkIndex = 0;
    }
  }
}
