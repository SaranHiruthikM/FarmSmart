import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Bell, TrendingUp, Info, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import notificationService from "../services/notification.service";

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'PRICE':
      return <TrendingUp className="w-6 h-6 text-green-600" />;
    case 'SUCCESS':
    case 'SYSTEM':
      return <CheckCircle2 className="w-6 h-6 text-blue-600" />;
    case 'WARNING':
      return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    case 'ERROR':
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    case 'INFO':
    default:
      return <Info className="w-6 h-6 text-gray-500" />;
  }
};

const getBgColor = (type, read) => {
  if (read) return 'bg-gray-100';
  switch (type) {
    case 'PRICE': return 'bg-green-100';
    case 'SUCCESS': return 'bg-blue-100';
    case 'WARNING': return 'bg-orange-100';
    case 'ERROR': return 'bg-red-100';
    default: return 'bg-gray-100';
  }
};

const NotificationItem = ({ notification, onRead, t }) => {
  const getTitle = (type) => {
    switch (type) {
      case 'PRICE': return t('notifications.newBid');
      case 'SUCCESS': return t('common.success');
      case 'WARNING': return t('notifications.alert');
      default: return t('nav.notifications');
    }
  };

  return (
    <div
      className={`
                p-5 border-b last:border-0 hover:bg-gray-50 transition-all cursor-pointer rounded-xl mb-3 border
                ${!notification.read ? 'bg-white border-green-200 shadow-sm relative overflow-hidden' : 'bg-gray-50 border-transparent opacity-75'}
            `}
      onClick={() => onRead(notification.id)}
    >
      {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />}

      <div className="flex gap-4 items-start">
        <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center shrink-0
                    ${getBgColor(notification.type, false)} 
                `}>
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`text-base font-bold mb-1 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
              {getTitle(notification.type)}
            </h4>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {new Date(notification.time).toLocaleString('en-IN', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          <p className={`text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-500'} leading-relaxed`}>
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
};

function Notifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      if (notifications.length === 0) setLoading(true);
      const data = await notificationService.getNotifications();
      data.sort((a, b) => new Date(b.time) - new Date(a.time));
      if (data.length !== notifications.length || loading) {
        setNotifications(data);
      }
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

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = filter === 'UNREAD' ? notifications.filter(n => !n.read) : notifications;

  if (loading && notifications.length === 0) return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="animate-spin text-green-600 w-10 h-10" />
    </div>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-6 md:py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 md:gap-4 mb-2">
            <div className="p-2 md:p-3 bg-green-100 rounded-2xl shrink-0">
              <Bell className="w-6 h-6 md:w-8 md:h-8 text-green-700" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">{t('nav.notifications')}</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-lg font-medium ml-1 md:ml-2">{t('notifications.subtitle')}</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 md:p-2 rounded-2xl shadow-sm border border-gray-200 self-start md:self-auto w-full md:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 rounded-xl text-sm md:text-base font-bold transition-all ${filter === 'ALL' ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('notifications.all')}
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 rounded-xl text-sm md:text-base font-bold transition-all flex items-center justify-center gap-2 md:gap-3 ${filter === 'UNREAD' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Unread
            {unreadCount > 0 && <span className={`text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg ${filter === 'UNREAD' ? 'bg-white/20 text-white' : 'bg-green-500 text-white'}`}>{unreadCount}</span>}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="min-h-[70vh]">
        {displayedNotifications.length > 0 ? (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex justify-end mb-4">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="px-4 py-2 rounded-xl text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {t('notifications.markAllRead')}
                </button>
              )}
            </div>
            {displayedNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleRead}
                t={t}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center bg-gray-50/30 rounded-[3rem] border-4 border-dashed border-gray-200/60 group hover:bg-gray-50/50 transition-colors">
            <div className="bg-white p-12 rounded-full shadow-xl shadow-gray-100 mb-10 group-hover:scale-110 transition-transform duration-300">
              <Bell className="w-32 h-32 text-gray-200" />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('notifications.none')}</h3>
            <p className="text-gray-400 text-xl max-w-lg font-medium leading-relaxed">
              {filter === 'UNREAD'
                ? t('notifications.allCaughtUp')
                : t('notifications.willNotify')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
