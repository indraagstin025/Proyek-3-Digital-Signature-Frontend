# 🔒 SOFT LOCK Implementation Guide

**Status**: ✅ COMPLETED  
**Date**: January 1, 2026

---

## 📋 Overview

**Soft Lock** adalah strategi yang memperbolehkan user untuk terus **READ/VIEW** data lama mereka, tetapi **BLOCK CREATE actions** ketika limit tercapai. Data mereka tetap aman dan accessible.

### Karakteristik Soft Lock:

- ✅ **User tetap bisa VIEW data** yang sudah ada
- ✅ **User tetap bisa SIGN documents** yang sudah ditugaskan
- ❌ **Blocked: CREATE dokumen baru** ketika limit tercapai
- ❌ **Blocked: CREATE grup baru** ketika limit tercapai
- ❌ **Blocked: UPLOAD file baru** ketika limit tercapai
- 📢 **Clear error messages** dengan upgrade CTA

---

## 🛠️ Components Created

### 1. **SoftLockError** Component

**File**: `src/components/ui/SoftLockError.jsx`

Beautiful error modal yang muncul ketika user mencoba action yang blocked.

```jsx
import { SoftLockError } from "../components/ui/SoftLockError";

const [softLockError, setSoftLockError] = useState(null);

<SoftLockError isOpen={!!softLockError} onClose={() => setSoftLockError(null)} errorMessage="Anda telah mencapai batas..." actionType="create_document" feature="documents" />;
```

**Features**:

- Custom error message per action type
- "What you can still do" section (View, Sign, Manage existing data)
- Premium benefits highlight
- Upgrade CTA button
- Dark mode support

---

### 2. **useCanPerformAction** Hook

**File**: `src/hooks/useCanPerformAction.js`

Detect apakah user bisa perform action tertentu berdasarkan quota limit.

```jsx
import { useCanPerformAction } from "../hooks/useCanPerformAction";

const {
  canPerform, // boolean
  reason, // error message (full detail)
  shortReason, // error message (short)
  isAtLimit, // boolean
  limit, // max limit
  currentUsage, // current usage
  isPremium, // boolean
} = useCanPerformAction("create_document", currentDocCount);

if (!canPerform) {
  // Show error
}
```

**Supported Action Types**:

- `create_document` - Upload/create dokumen
- `create_group` - Buat workspace/grup
- `add_member` - Tambah anggota grup
- `upload_file` - Upload file (by size)
- `create_version` - Buat versi dokumen
- `create_package` - Buat package signature

---

## 📍 Implementation Points

### 1. **GroupDocuments** (Create Document Soft Lock)

**File**: `src/pages/GroupPage/GroupDocuments.jsx`

```jsx
import { useCanPerformAction } from "../../hooks/useCanPerformAction";
import { SoftLockError } from "../../components/ui/SoftLockError";

// State
const [softLockError, setSoftLockError] = useState(null);

// Check soft lock
const { canPerform: canCreateDoc, reason: createDocReason } = useCanPerformAction("create_document", currentDocCount);

// Handler
const handleUploadClick = () => {
  if (!canCreateDoc) {
    setSoftLockError({
      message: createDocReason,
      actionType: "create_document",
    });
    return;
  }
  setIsUploadModalOpen(true);
};

// Render error modal
<SoftLockError isOpen={!!softLockError} onClose={() => setSoftLockError(null)} errorMessage={softLockError?.message} actionType={softLockError?.actionType} />;
```

---

### 2. **UploadGroupDocumentModal** (Upload Document Soft Lock)

**File**: `src/components/UploadGroupDocumentModal/UploadGroupDocumentModal.jsx`

```jsx
import { useCanPerformAction } from "../../hooks/useCanPerformAction";

const { canPerform: canCreateDoc, reason: createDocReason } = useCanPerformAction("create_document", currentDocCount);

const handleSubmit = (e) => {
  e.preventDefault();

  // Check soft lock FIRST
  if (!canCreateDoc) {
    toast.error(createDocReason, {
      duration: 5000,
      icon: "🔒",
    });
    onClose();
    return;
  }

  // ... continue with validation
};
```

**Props**:

- `currentDocCount` - Current document count (untuk soft lock check)

**Usage**:

```jsx
<UploadGroupDocumentModal
  isOpen={isUploadModalOpen}
  onClose={() => setIsUploadModalOpen(false)}
  groupId={groupId}
  members={members}
  currentDocCount={documents.length} // <- PENTING
/>
```

---

### 3. **CreateGroupModal** (Create Group Soft Lock)

**File**: `src/components/CreateGroupModal/CreateGroupModal.jsx`

```jsx
import { useCanPerformAction } from "../../hooks/useCanPerformAction";

const { canPerform: canCreateGroup, reason: createGroupReason } = useCanPerformAction("create_group", currentGroupCount);

const handleCreate = () => {
  if (!canCreateGroup) {
    toast.error(createGroupReason, {
      duration: 5000,
      icon: "🔒",
    });
    onClose();
    return;
  }

  onGroupCreate(groupData);
};
```

**Props**:

- `currentGroupCount` - Current group count (untuk soft lock check)

**Usage**:

```jsx
<CreateGroupModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onGroupCreate={handleCreateGroup}
  isLoading={isCreatingGroup}
  currentGroupCount={currentGroupCount} // <- PENTING
/>
```

---

### 4. **Error Handler** (Soft Lock Error Detection)

**File**: `src/services/errorHandler.js`

```jsx
import { handleErrorWithToast } from "../services/errorHandler";

try {
  await apiClient.post("/groups", { name });
} catch (error) {
  // Auto-detect 403 soft lock errors & show with 🔒 icon
  handleErrorWithToast(error, "Gagal membuat grup");
}
```

**Features**:

- Auto-detect 403 status = soft lock
- Auto-detect keywords: "upgrade", "limit", "batas", "kapasitas", "penuh"
- Show 🔒 icon untuk soft lock errors
- Longer duration (5000ms) untuk soft lock errors

---

## 🔄 Complete Flow

```
User tries to CREATE (upload document, create group, etc)
    ↓
useCanPerformAction checks limit
    ↓
Is limit reached?
    ├─ NO  → Allow action, open modal/form
    │
    └─ YES → Soft Lock triggered!
         ├─ Show SoftLockError modal
         ├─ Explain what they can still do (VIEW, SIGN, etc)
         ├─ Show Premium benefits
         └─ Provide Upgrade CTA
```

---

## 💡 Key Points

### What's BLOCKED (Soft Lock):

- ❌ Creating new documents/uploading new files
- ❌ Creating new groups/workspaces
- ❌ Adding new members (when limit reached)
- ❌ Creating new versions (when limit reached)
- ❌ Creating signature packages (when limit reached)

### What's NOT Blocked:

- ✅ Viewing existing documents
- ✅ Signing documents (that are already in system)
- ✅ Managing existing data
- ✅ Downloading/exporting documents
- ✅ Searching & filtering documents

### Error Messages:

All error messages come from backend dan automatically shown di Toast:

```
"Anda telah mencapai batas pembuatan grup (1/1 grup).
 Upgrade ke Premium untuk membuat hingga 10 grup."
```

---

## 🧪 Testing Soft Lock

1. **Create Group Soft Lock**:

   - FREE user: Buat 1 grup, coba buat 2nd → Soft lock
   - Click "Buat Grup Baru" button → Modal closes + error toast

2. **Upload Document Soft Lock**:

   - FREE group: Upload 10 dokumen, coba upload 11th → Soft lock
   - Click "Upload Baru" → Error toast + SoftLockError modal

3. **File Size Validation**:

   - Select file > 10 MB as FREE → Error toast (before submission)
   - Select file > 50 MB as PREMIUM → Error toast

4. **Backend Error 403**:
   - If soft lock slips past frontend → Backend returns 403
   - Error handler auto-detects 403 → Shows with 🔒 icon

---

## 📚 File Summary

| File                           | Purpose               | Status     |
| ------------------------------ | --------------------- | ---------- |
| `SoftLockError.jsx`            | Beautiful error modal | ✅ Created |
| `useCanPerformAction.js`       | Soft lock detector    | ✅ Created |
| `GroupDocuments.jsx`           | Integrated soft lock  | ✅ Updated |
| `UploadGroupDocumentModal.jsx` | Soft lock check       | ✅ Updated |
| `CreateGroupModal.jsx`         | Soft lock check       | ✅ Updated |
| `DashboardWorkspaces.jsx`      | Pass group count      | ✅ Updated |
| `errorHandler.js`              | Detect 403 errors     | ✅ Updated |

---

## 🎯 Next Steps (Optional)

1. Add soft lock animation/transitions
2. Add analytics tracking untuk soft lock events
3. Add A/B testing untuk upgrade CTA messages
4. Add "Continue for Premium" button (fast upgrade flow)
5. Add notification untuk users approaching limit (80-90%)

---

**Last Updated**: January 1, 2026  
**Implementation Status**: ✅ COMPLETE  
**Ready for Production**: ✅ YES
