import { motion, AnimatePresence } from 'framer-motion';
import { useTeamStore, type Notification } from '../store/teamStore';
import './LiveNotifications.css';

export const LiveNotifications: React.FC = () => {
    const { notifications } = useTeamStore();

    const getNotificationStyle = (type: Notification['type']) => {
        switch (type) {
            case 'streak_alert':
                return { background: 'rgba(255, 69, 0, 0.9)', icon: '🔥' };
            case 'power_up_used':
                return { background: 'rgba(138, 43, 226, 0.9)', icon: '⚡' };
            case 'answer_correct':
                return { background: 'rgba(0, 255, 136, 0.9)', icon: '✅' };
            case 'answer_wrong':
                return { background: 'rgba(255, 0, 0, 0.9)', icon: '❌' };
            case 'points_stolen':
                return { background: 'rgba(255, 215, 0, 0.9)', icon: '💰' };
            default:
                return { background: 'rgba(100, 100, 100, 0.9)', icon: '📢' };
        }
    };

    return (
        <div className="live-notifications-container">
            <AnimatePresence>
                {notifications.map((notif) => {
                    const style = getNotificationStyle(notif.type);

                    return (
                        <motion.div
                            key={notif.id}
                            className="notification-toast"
                            style={{ background: style.background }}
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -400, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            layout
                        >
                            <div className="notification-icon">{style.icon}</div>
                            <div className="notification-message">{notif.message}</div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
