/**
 * PremiumBadge Component (DEPRECATED)
 *
 * ⚠️  DEPRECATED: Gunakan BadgeUser component sebagai gantinya
 * File ini disimpan hanya untuk backward compatibility
 *
 * Migration:
 * OLD: import { PremiumBadge } from "./PremiumBadge";
 * NEW: import BadgeUser from "./BadgeUser/BadgeUser";
 *
 * Gunakan BadgeUser dengan:
 * <BadgeUser userStatus={userStatus} isLoading={isLoading} />
 */

// Re-export BadgeUser sebagai PremiumBadge untuk backward compatibility
import BadgeUser from "../BadgeUser/BadgeUser";

export const PremiumBadge = BadgeUser;
export default BadgeUser;
