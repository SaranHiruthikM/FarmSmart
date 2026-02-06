import { useState, useEffect } from "react";
import { Loader2, Bell, TrendingUp, Info, CheckCircle2 } from "lucide-react";
import notificationService from "../services/notification.service";

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'PRICE':
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    case 'SYSTEM':
      return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    case 'INFO':
    default:
      return <Info className="w-5 h-5 text-orange-500" />;
  }
};

const NotificationItem = ({ notification, onRead }) => {
  const isPrice = notification.type === 'PRICE';

  return (
    <div
      className={`
                p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer
                ${!notification.read ? 'bg-green-50/50' : 'bg-white'}
            `}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex gap-4">
        <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${isPrice ? 'bg-green-100' : notification.type === 'SYSTEM' ? 'bg-blue-100' : 'bg-orange-100'}
                `}>
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <span className={`
                            text-xs font-bold px-2 py-0.5 rounded-full
                            ${isPrice ? 'bg-green-100 text-green-700' : notification.type === 'SYSTEM' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}
                        `}>
              {notification.type}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(notification.time).toLocaleString('en-IN', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
            {notification.message}
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      // Sort by time (newest first)
      data.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {unreadCount} Unread
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={handleRead}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
            <Bell className="w-12 h-12 mb-4 opacity-20" />
            <p>No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
