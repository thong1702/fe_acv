import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../constants/environment';
import { CompanyInfo } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CompanyInfoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/company-info`;

  private mockCompanyInfo: CompanyInfo = {
    id: 1,
    introduction: `
      <p><strong>Công ty TNHH Tư vấn và Định giá ACV</strong> (ACV Consulting and Valuation Company Limited) là một tổ chức tư vấn độc lập, chuyên nghiệp và hợp pháp hoạt động trong các lĩnh vực chuyên sâu: <strong>Tư vấn - Tài chính - Thuế - Thẩm định giá và Kế toán</strong>.</p>
      <p>Trải qua hơn 14 năm phát triển bền bỉ (từ năm 2011), ACV tự hào quy tụ đội ngũ chuyên gia, thẩm định viên và nhân sự chất lượng cao, có năng lực chuyên môn xuất sắc và kinh nghiệm thực tiễn phong phú. Phương châm cốt lõi của chúng tôi là: <strong>"Uy tín và chất lượng là tiêu chí khẳng định thương hiệu ACV"</strong> cùng cam kết tuân thủ các nguyên tắc nghề nghiệp cao nhất: <strong>"Độc lập, khách quan và bí mật thông tin"</strong>.</p>
      <p>Chúng tôi luôn nỗ lực tối đa để cung cấp những dịch vụ thẩm định giá tốt nhất, đáng tin cậy nhất và đáp ứng kịp thời tiến độ của Quý khách hàng trên toàn quốc.</p>
    `,
    history: `
      <p><strong>• Ngày 03/11/2011:</strong> Công ty TNHH Tư vấn và Định giá ACV chính thức được thành lập theo Giấy chứng nhận đăng ký doanh nghiệp số 0105606849 do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp.</p>
      <p><strong>• Ngày 23/01/2024:</strong> Đăng ký thay đổi lần thứ 13, kiện toàn bộ máy nhân sự cấp cao và nâng tổng số vốn điều lệ lên 5.000.000.000 VNĐ (Năm tỷ đồng) để mở rộng các chi nhánh.</p>
      <p><strong>• Tháng 03/2024:</strong> Được Bộ Tài chính cấp Giấy chứng nhận đủ điều kiện kinh doanh dịch vụ thẩm định giá lần đầu (Mã số: 464/TĐG).</p>
      <p><strong>• Ngày 21/05/2026:</strong> Bộ Tài chính cấp lại Giấy chứng nhận đủ điều kiện kinh doanh dịch vụ thẩm định giá lần thứ 1 sau quá trình kiểm tra năng lực kỹ lưỡng.</p>
      <p><strong>• Dự án nổi bật 2025-2026:</strong> ACV vinh dự lọt danh sách các tổ chức thẩm định giá độc lập uy tín được Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV) chính thức lựa chọn hợp tác để xử lý tài sản bảo đảm.</p>
    `,

    contactInfo: `
      <p>📍 <strong>Trụ sở chính:</strong> Tầng 9, Tòa nhà 3D Center, Số 3 Phố Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, TP. Hà Nội</p>
      <p>📍 <strong>Văn phòng GD:</strong> Tầng 7, Tòa nhà Hoa Đăng, 290 Nguyễn Trãi, Phường Đại Mỗ, Quận Nam Từ Liêm, TP. Hà Nội</p>
      <p>📞 <strong>Hotline:</strong> 0986.882.868</p>
      <p>✉️ <strong>Email:</strong> acvvaluation@gmail.com | info@acv.vn</p>
    `
  };

  getCompanyInfo(): Observable<CompanyInfo> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => {
        return {
          id: res.id,
          introduction: res.introduction,
          history: res.historyTimeline,
          contactInfo: res.address
        } as CompanyInfo;
      }),
      catchError(() => {
        console.warn('Backend offline, loading fallback company info mock data...');
        return of(this.mockCompanyInfo);
      })
    );
  }

  updateCompanyInfo(info: CompanyInfo): Observable<CompanyInfo> {
    const backendPayload = {
      id: info.id,
      companyName: "Công ty TNHH Tư vấn và Định giá ACV",
      introduction: info.introduction,
      historyTimeline: info.history,
      address: info.contactInfo,
      phone: "",
      email: ""
    };
    return this.http.put<any>(this.baseUrl, backendPayload).pipe(
      map(res => {
        return {
          id: res.id,
          introduction: res.introduction,
          history: res.historyTimeline,
          contactInfo: res.address
        } as CompanyInfo;
      }),
      catchError(() => {
        this.mockCompanyInfo = { ...info };
        return of(this.mockCompanyInfo);
      })
    );
  }
}
