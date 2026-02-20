import DivisionPage from "@/components/DivisionPage";
import { CreditCard, FileCheck, Users, Calculator, AlertTriangle, RefreshCw } from "lucide-react";

export default function Payroll() {
  return (
    <DivisionPage
      title="Payroll Management Division"
      subtitle="Development, implementation and review of payroll policies for all government employees."
      purpose="The Payroll Management Division is responsible for the development, implementation and review of payroll policies affecting all government employees. It manages compensation delivery, payment schedules, monthly payment voucher validation, payroll reports, deduction processing, overpayment recovery, and mechanized payroll migration."
      dcag="Mr. Baffour Kyei"
      dcagTitle="DCAG, Payroll Management Systems"
      directorates={[
        { name: "Active Payroll Processing", description: "Processes monthly salaries for all active government employees across 703 MDA spending units. Handles new additions, salary adjustments, promotions, transfers, and all changes to the active government payroll." },
        { name: "Pensions Payroll Processing", description: "Manages pension payments for retired government employees under CAP 30 and other pension schemes. Handles pension calculations, annual verification, and ensures timely payment to all pensioners." },
      ]}
      functions={[
        { icon: CreditCard, title: "Compensation Delivery", desc: "Managing methods and channels for salary and pension payment delivery via EFT." },
        { icon: FileCheck, title: "Payment Voucher Validation", desc: "Monthly validation of payment vouchers through the E-SPV system." },
        { icon: Calculator, title: "Payroll Reports", desc: "Producing monthly, quarterly, and annual payroll statistical reports." },
        { icon: Users, title: "Deduction Processing", desc: "Managing TPRS deductions for banks, insurance, unions, and welfare associations." },
        { icon: AlertTriangle, title: "Overpayment Recovery", desc: "Detecting and recovering overpayments and salary irregularities." },
        { icon: RefreshCw, title: "Payroll Migration", desc: "Transitioning legacy payroll systems to modernized mechanized platforms." },
      ]}
    />
  );
}
