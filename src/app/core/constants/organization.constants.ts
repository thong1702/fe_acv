export interface OrgStructureNode {
  id: string;
  deptId: number; // Numeric ID to match database parentId
  name: string;
  position: string;
  icon: string;
  type: 'root' | 'primary' | 'side' | 'dept';
  relationType?: 'direct' | 'cooperate';
  parentId?: string | null;
}

export interface CoreValueConstant {
  title: string;
  description: string;
  icon: string;
}

export const ORG_STRUCTURE_NODES: OrgStructureNode[] = [
  {
    id: 'HOI_DONG_THANH_VIEN',
    deptId: 1,
    name: 'HỘI ĐỒNG THÀNH VIÊN',
    position: 'QUYẾT ĐỊNH ĐỊNH HƯỚNG CHIẾN LƯỢC',
    icon: 'groups',
    type: 'root',
    parentId: null
  },
  {
    id: 'BAN_KIEM_SOAT_CHAT_LUONG',
    deptId: 2,
    name: 'BAN KIỂM SOÁT CHẤT LƯỢNG',
    position: 'KIỂM TRA – GIÁM SÁT – ĐẢM BẢO CHẤT LƯỢNG',
    icon: 'shield-check',
    type: 'side',
    relationType: 'cooperate',
    parentId: 'BAN_GIAM_DOC'
  },
  {
    id: 'BAN_GIAM_DOC',
    deptId: 3,
    name: 'BAN GIÁM ĐỐC',
    position: 'ĐIỀU HÀNH & QUẢN LÝ CHUNG',
    icon: 'manager',
    type: 'primary',
    relationType: 'direct',
    parentId: 'HOI_DONG_THANH_VIEN'
  },
  {
    id: 'BAN_CO_VAN',
    deptId: 4,
    name: 'BAN CỐ VẤN',
    position: 'TƯ VẤN CHIẾN LƯỢC – HỖ TRỢ CHUYÊN MÔN',
    icon: 'groups',
    type: 'side',
    relationType: 'cooperate',
    parentId: 'BAN_GIAM_DOC'
  },
  {
    id: 'PHONG_KE_TOAN',
    deptId: 5,
    name: 'PHÒNG KẾ TOÁN',
    position: 'Kế toán – Tài chính – Quản trị dòng tiền',
    icon: 'chart-bar',
    type: 'dept',
    relationType: 'direct',
    parentId: 'BAN_GIAM_DOC'
  },
  {
    id: 'PHONG_THAM_DINH_GIA_1',
    deptId: 6,
    name: 'PHÒNG THẨM ĐỊNH GIÁ 1',
    position: 'Thẩm định giá tài sản, doanh nghiệp, dự án (Khu vực 1)',
    icon: 'file-text',
    type: 'dept',
    relationType: 'direct',
    parentId: 'BAN_GIAM_DOC'
  },
  {
    id: 'PHONG_THAM_DINH_GIA_2',
    deptId: 7,
    name: 'PHÒNG THẨM ĐỊNH GIÁ 2',
    position: 'Thẩm định giá tài sản, doanh nghiệp, dự án (Khu vực 2)',
    icon: 'file-search',
    type: 'dept',
    relationType: 'direct',
    parentId: 'BAN_GIAM_DOC'
  },
  {
    id: 'PHONG_HANH_CHINH_TONG_HOP',
    deptId: 8,
    name: 'PHÒNG HÀNH CHÍNH TỔNG HỢP',
    position: 'Hành chính – Nhân sự – Pháp chế – Quản trị nội bộ',
    icon: 'groups',
    type: 'dept',
    relationType: 'direct',
    parentId: 'BAN_GIAM_DOC'
  },
  {
    id: 'CAC_CHI_NHANH_VAN_PHONG',
    deptId: 9,
    name: 'CÁC CHI NHÁNH VÀ VĂN PHÒNG ĐẠI DIỆN',
    position: 'Triển khai nghiệp vụ, phục vụ khách hàng tại các địa bàn',
    icon: 'building',
    type: 'dept',
    relationType: 'direct',
    parentId: 'BAN_GIAM_DOC'
  }
];

export const ORG_CORE_VALUES: CoreValueConstant[] = [
  {
    title: 'CHUYÊN NGHIỆP',
    description: 'Hiệu quả trong mọi quy trình',
    icon: 'target'
  },
  {
    title: 'ĐỘC LẬP',
    description: 'Khách quan trong mọi đánh giá',
    icon: 'shield'
  },
  {
    title: 'UY TÍN',
    description: 'Cam kết chất lượng và bảo mật thông tin',
    icon: 'handshake'
  },
  {
    title: 'HIỆU QUẢ',
    description: 'Mang lại giá trị bền vững cho khách hàng',
    icon: 'trending-up'
  }
];
