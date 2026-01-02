# 📱 Implementation Guide - Frontend Premium/Freemium System

**Status**: ✅ COMPLETED  
**Date**: January 1, 2026  
**Version**: v1.0

---

## 🎯 Overview

Implementasi frontend untuk sistem **Premium/Freemium** dengan fitur **Soft Lock** telah selesai. Sistem ini menggunakan:

- ✅ **QuotaContext** untuk state global quota management
- ✅ **useQuota Hook** untuk akses quota di seluruh aplikasi
- ✅ **useFileUpload Hook** untuk validasi ukuran file
- ✅ **UI Components** untuk display status dan warnings
- ✅ **Error Handling** khusus untuk limit/quota errors

---

## 📁 File Structure

### Core Files Created:

```
src/
├── context/
│   └── QuotaContext.jsx              # ✨ Global quota state management
├── services/
│   └── userService.js                # ✅ Added getQuota() function
├── hooks/
│   └── useFileUpload.js              # 📋 File size validation hook
├── components/ui/
│   ├── PremiumBadge.jsx              # 🏆 Status badge (FREE/PREMIUM)
│   ├── QuotaProgressBar.jsx          # 📊 Usage progress bar
│   └── UpgradePromptModal.jsx        # 🚀 Upgrade CTA modal
├── pages/GroupPage/
│   └── GroupDocuments.jsx            # ✅ Updated dengan useQuota
└── main.jsx                          # ✅ Added QuotaProvider wrapper
```

### Modified Files:

- `src/main.jsx` - Added QuotaProvider
- `src/services/userService.js` - Added getQuota() export
- `src/services/errorHandler.js` - Improved error handling untuk limit errors
- `src/pages/GroupPage/GroupDocuments.jsx` - Integrated useQuota
- `src/components/UploadGroupDocumentModal/UploadGroupDocumentModal.jsx` - Added file size validation

---

## 🔧 Implementation Details

### 1. QuotaContext & QuotaProvider

**File**: `src/context/QuotaContext.jsx`

```jsx
import { useQuota } from "../context/QuotaContext";

// Anywhere in your component:
const { quota, loading, isPremium, limits, usage, refreshQuota } = useQuota();
```

**Features**:

- Automatically fetch quota on app load
- Global state management
- `refreshQuota()` for manual refetch after actions
- Error handling dengan fallback

**Properties returned**:

- `quota`: Full quota object with limits, usage, etc.
- `loading`: Loading state
- `error`: Error object if fetch failed
- `isPremium`: Boolean - is user premium?
- `userStatus`: "FREE" or "PREMIUM"
- `limits`: Object with all limit values
- `usage`: Object with current usage
- `premiumUntil`: Expiry date (if premium)

---

### 2. PremiumBadge Component

**File**: `src/components/ui/PremiumBadge.jsx`

Display user's premium status with animated badge.

```jsx
import { PremiumBadge } from "../components/ui/PremiumBadge";

// In Header/Navbar:
<PremiumBadge />;
```

**Features**:

- Shows "PREMIUM" with sparkle icon if premium
- Shows "FREE" with user icon if free
- Loading state
- Responsive design

---

### 3. QuotaProgressBar Component

**File**: `src/components/ui/QuotaProgressBar.jsx`

Display usage progress dengan color indication.

```jsx
import { QuotaProgressBar } from "../components/ui/QuotaProgressBar";

// Example usage:
<QuotaProgressBar type="groups" currentValue={3} label="Grup Dibuat" />;
```

**Supported Types**:

- `groups` - Max owned groups
- `docsPerGroup` - Max docs per group
- `docsPerPackage` - Max docs per package
- `versions` - Max versions per doc
- `members` - Max members per group
- `fileSize` - Max file size

**Color Logic**:

- 🟢 Green: < 80%
- 🟡 Yellow: 80-99%
- 🔴 Red: 100% (limit reached)

---

### 4. UpgradePromptModal Component

**File**: `src/components/ui/UpgradePromptModal.jsx`

Beautiful modal untuk prompt upgrade ketika limit tercapai.

```jsx
import { UpgradePromptModal } from "../components/ui/UpgradePromptModal";

const [showUpgradeModal, setShowUpgradeModal] = useState(false);

<UpgradePromptModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  feature="groups" // or "fileSize", "members", "docs", "versions", "package"
/>;
```

**Features**:

- Feature-specific messaging
- Before/After comparison
- List of all premium benefits
- Upgrade CTA button
- Close / Later option

---

### 5. useFileUpload Hook

**File**: `src/hooks/useFileUpload.js`

Validate file size before upload based on user's quota.

```jsx
import { useFileUpload } from "../hooks/useFileUpload";

const { validateFileSize, handleFileSelect, maxFileSize, maxFileSizeLabel } = useFileUpload();

// Manual validation:
const validation = validateFileSize(file);
if (!validation.valid) {
  toast.error(validation.error);
  return;
}

// Or use handler (recommended):
handleFileSelect(file, (validFile) => {
  // Process valid file
  uploadFile(validFile);
});
```

**Returns**:

- `validateFileSize(file)` - Return { valid, error }
- `handleFileSelect(file, onValid)` - Handle dengan validation + toast
- `maxFileSize` - Max size in bytes
- `maxFileSizeLabel` - Max size label (e.g., "10 MB")
- `isPremium` - Boolean

---

### 6. useQuota Hook

**Hook created in**: `src/context/QuotaContext.jsx`

**Usage**:

```jsx
const { quota, loading, limits, usage, isPremium, refreshQuota } = useQuota();

// Example: Check if user can create another group
if (usage.ownedGroups >= limits.maxOwnedGroups) {
  // Limit reached!
}
```

---

## 🛠️ Integration Points

### GroupDocuments Component (src/pages/GroupPage/GroupDocuments.jsx)

**Updated**:

1. Import `useQuota` hook
2. Get global premium status dari quota context
3. Use premium status untuk determine MAX_DOCS limit
4. Show progress bar dengan limit indication

**Key Changes**:

```jsx
const { quota } = useQuota(); // Get premium status

// Determine premium status dari context (lebih reliable)
const isOwnerPremium = quota?.userStatus === "PREMIUM" ? true : groupData?.admin?.userStatus === "PREMIUM";

const MAX_DOCS = isOwnerPremium ? 100 : 10;
```

---

### UploadGroupDocumentModal Component

**Updated**:

1. Import `useFileUpload` hook
2. Add file size validation di handleSubmit
3. Display max file size info di UI

**Key Changes**:

```jsx
const { validateFileSize, maxFileSizeLabel } = useFileUpload();

// Di form:
<label className="text-sm font-semibold">
  File PDF <span className="text-xs text-slate-500">({maxFileSizeLabel} maksimal)</span>
</label>;

// Di handleSubmit:
const validation = validateFileSize(file);
if (!validation.valid) {
  toast.error(validation.error);
  return;
}
```

---

## 📊 Quota Limits Table

| Feature           | FREE  | PREMIUM   |
| ----------------- | ----- | --------- |
| File Size         | 10 MB | 50 MB     |
| Versions per Doc  | 5     | 20        |
| Groups Owned      | 1     | 10        |
| Members per Group | 5     | Unlimited |
| Docs per Group    | 10    | 100       |
| Docs per Package  | 3     | 20        |

---

## 🎯 Usage Examples

### Example 1: Display User Status in Header

```jsx
import { PremiumBadge } from "../components/ui/PremiumBadge";

export const Header = () => {
  return (
    <header className="p-4 border-b">
      <div className="flex justify-between items-center">
        <h1>My App</h1>
        <PremiumBadge /> {/* Shows PREMIUM or FREE */}
      </div>
    </header>
  );
};
```

### Example 2: Show Quota Progress in Settings

```jsx
import { QuotaProgressBar } from "../components/ui/QuotaProgressBar";
import { useQuota } from "../context/QuotaContext";

export const QuotaSettings = () => {
  const { quota } = useQuota();

  return (
    <div className="space-y-6">
      <QuotaProgressBar type="groups" currentValue={quota?.usage?.ownedGroups} label="Grup yang Dibuat" />
      <QuotaProgressBar type="docsPerGroup" currentValue={docCount} label="Dokumen di Grup Ini" />
    </div>
  );
};
```

### Example 3: Handle Limit Error in Action

```jsx
import { handleErrorWithToast } from "../services/errorHandler";

const handleCreateGroup = async (name) => {
  try {
    await groupService.createGroup(name);
  } catch (error) {
    // Will show toast if limit error
    handleErrorWithToast(error, "Gagal membuat grup");
  }
};
```

### Example 4: Refresh Quota After Action

```jsx
import { useQuota } from "../context/QuotaContext";

const MyComponent = () => {
  const { refreshQuota } = useQuota();

  const handleUpload = async (file) => {
    // Upload file...
    await uploadFile(file);

    // Refresh quota to update usage
    await refreshQuota();
  };
};
```

---

## 🔐 Error Handling

Error handler di `src/services/errorHandler.js` sudah diupdate untuk handle quota/limit errors dengan better UX.

**Features**:

- Auto-detect limit errors (contains "upgrade", "limit", "batas", "kapasitas")
- Show toast dengan icon 🔒 untuk limit errors
- Show icon ⛔ untuk forbidden (403) errors
- Customizable default message

**Usage**:

```jsx
try {
  // API call
} catch (error) {
  handleErrorWithToast(error, "Default message jika error tidak memiliki message");
}
```

---

## ✨ Best Practices

1. **Fetch quota sekali saat login** - Sudah dilakukan di QuotaProvider
2. **Refresh quota setelah aksi yang mengubah usage** - Gunakan `refreshQuota()`
3. **Validate di Frontend** untuk UX yang lebih baik, **tapi Backend tetap validasi** untuk keamanan
4. **Cache quota** dengan TTL untuk mengurangi API calls
5. **Tampilkan warning** saat usage >= 80% dari limit
6. **Disable button** saat limit tercapai, jangan tunggu error dari backend

---

## 🚀 Next Steps / Future Improvements

1. **Add PremiumExpiryWarning component** - Show warning saat premium hampir expired
2. **Add DowngradeNotification component** - Notify user ketika premium expired
3. **Integrate dengan payment page** - Show pricing dan subscription management
4. **Cache quota** dengan React Query - Reduce API calls
5. **Add analytics** - Track quota usage untuk product insights
6. **Add quota indicators** di more pages - Show quota progress di dashboard, profile, dll

---

## 🧪 Testing Checklist

- [ ] QuotaContext loads on app start
- [ ] PremiumBadge displays correctly
- [ ] QuotaProgressBar shows correct usage
- [ ] File upload validation works
- [ ] Error toast shows for limit errors
- [ ] Upgrade modal shows when limit reached
- [ ] refreshQuota updates data correctly
- [ ] Limit logic works untuk group documents

---

## 📚 Related Documentation

- Backend API: See `FRONTEND_PREMIUM_IMPLEMENTATION.md` dalam Backend repo
- Endpoints: `/api/users/me/quota`, `/api/users/me`

---

**Last Updated**: January 1, 2026  
**Implementation Status**: ✅ COMPLETE
