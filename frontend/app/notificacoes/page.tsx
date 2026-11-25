import PrivateLayout from "../components/funcionario/PrivateLayout";
import NotificationsPage from "../../components/NotificationCenter";
export default function Page() { return <PrivateLayout><NotificationsPage /></PrivateLayout>; }

export const metadata = { title: "Notificações" };
