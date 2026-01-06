'use client';

import dynamic from 'next/dynamic';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Student, EnrollmentWithDetails, Payment } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Register Turkish-friendly font
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#7c3aed',
  },
  subheader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
  badge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 8,
  },
  badgeWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
});

// Student Card PDF
interface StudentCardProps {
  student: Student;
  enrollments: EnrollmentWithDetails[];
  payments: Payment[];
}

export function StudentCardPDF({ student, enrollments, payments }: StudentCardProps) {
  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Öğrenci Kartı</Text>
        
        <Text style={styles.subheader}>Kişisel Bilgiler</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Ad Soyad:</Text>
          <Text style={styles.value}>{student.firstName} {student.lastName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{student.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Telefon:</Text>
          <Text style={styles.value}>{student.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kayıt Tarihi:</Text>
          <Text style={styles.value}>{format(student.createdAt, 'd MMMM yyyy', { locale: tr })}</Text>
        </View>
        {student.kvkkConsentDate && (
          <View style={styles.row}>
            <Text style={styles.label}>KVKK Onayı:</Text>
            <Text style={styles.value}>{format(student.kvkkConsentDate, 'd MMMM yyyy', { locale: tr })}</Text>
          </View>
        )}

        <Text style={styles.subheader}>Aktif Kurslar ({activeEnrollments.length})</Text>
        {activeEnrollments.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Kurs</Text>
              <Text style={styles.tableCell}>Başlangıç</Text>
              <Text style={styles.tableCell}>Bitiş</Text>
              <Text style={styles.tableCell}>Kalan Gün</Text>
            </View>
            {activeEnrollments.map((e) => (
              <View style={styles.tableRow} key={e.id}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{e.course.name}</Text>
                <Text style={styles.tableCell}>{format(e.startDate, 'd MMM yy', { locale: tr })}</Text>
                <Text style={styles.tableCell}>{format(e.endDate, 'd MMM yy', { locale: tr })}</Text>
                <Text style={styles.tableCell}>{e.daysRemaining} gün</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text>Aktif kurs kaydı bulunmuyor.</Text>
        )}

        <Text style={styles.subheader}>Ödeme Özeti</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Toplam Ödenen:</Text>
          <Text style={styles.value}>{totalPaid.toLocaleString('tr-TR')} ₺</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bekleyen:</Text>
          <Text style={styles.value}>{totalPending.toLocaleString('tr-TR')} ₺</Text>
        </View>

        <Text style={styles.footer}>
          Bu belge {format(new Date(), 'd MMMM yyyy HH:mm', { locale: tr })} tarihinde oluşturulmuştur.
          © Cisem Dil Kursu
        </Text>
      </Page>
    </Document>
  );
}

// Attendance Report PDF
interface AttendanceReportProps {
  courseName: string;
  records: Array<{
    date: Date;
    studentName: string;
    status: string;
  }>;
}

export function AttendanceReportPDF({ courseName, records }: AttendanceReportProps) {
  const statusMap: Record<string, string> = {
    present: 'Var',
    absent: 'Yok',
    late: 'Geç',
    excused: 'İzinli',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Devam Cetveli</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>{courseName}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Tarih</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Öğrenci</Text>
            <Text style={styles.tableCell}>Durum</Text>
          </View>
          {records.map((r, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.tableCell}>{format(r.date, 'd MMM yyyy', { locale: tr })}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{r.studentName}</Text>
              <Text style={styles.tableCell}>{statusMap[r.status] || r.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          © Cisem Dil Kursu - {format(new Date(), 'd MMMM yyyy', { locale: tr })}
        </Text>
      </Page>
    </Document>
  );
}

// Payment Report PDF
interface PaymentReportProps {
  payments: Payment[];
  period: string;
}

export function PaymentReportPDF({ payments, period }: PaymentReportProps) {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Ödeme Raporu</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>{period}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Toplam:</Text>
          <Text style={styles.value}>{totalAmount.toLocaleString('tr-TR')} ₺</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Alınan:</Text>
          <Text style={styles.value}>{paidAmount.toLocaleString('tr-TR')} ₺</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Bekleyen:</Text>
          <Text style={styles.value}>{(totalAmount - paidAmount).toLocaleString('tr-TR')} ₺</Text>
        </View>

        <Text style={styles.subheader}>Detaylı Liste</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Vade</Text>
            <Text style={styles.tableCell}>Tutar</Text>
            <Text style={styles.tableCell}>Durum</Text>
          </View>
          {payments.map((p) => (
            <View style={styles.tableRow} key={p.id}>
              <Text style={styles.tableCell}>{format(p.dueDate, 'd MMM yyyy', { locale: tr })}</Text>
              <Text style={styles.tableCell}>{p.amount.toLocaleString('tr-TR')} ₺</Text>
              <Text style={styles.tableCell}>
                {p.status === 'paid' ? 'Ödendi' : p.status === 'overdue' ? 'Gecikmiş' : 'Bekliyor'}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          © Cisem Dil Kursu - {format(new Date(), 'd MMMM yyyy', { locale: tr })}
        </Text>
      </Page>
    </Document>
  );
}

// Dynamic import for PDFDownloadLink (client-side only)
export const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Yükleniyor...</span> }
);
