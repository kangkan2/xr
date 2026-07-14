# Security Specification & Threat Model for xrok App Market

## 1. Data Invariants
- **Identity Invariant**: Only authenticated users can submit reviews. Users cannot spoof their identifier or write reviews under another user's identity.
- **Admin Invariant**: Only users verified as administrators (specifically checking the authorized account `indiafff568@gmail.com` or explicit admin documents) can modify, upload, or toggle the visibility of application packages.
- **Data Integrity Invariant**: Apps must have verified structure with strict bounding controls on text lengths, package structures, and numbers of features/screenshots to prevent denial-of-wallet payload attacks.
- **Immutability Invariant**: Key tracking fields like `createdAt` and `appId` must be locked once submitted.

## 2. The "Dirty Dozen" Malicious Payloads (Vulnerability Vector Audit)
1. **Admin Privilege Escalation**: User registers or updates their own profile with `isAdmin: true` set via client-side mutation.
2. **Review Spoofing**: User submits a review setting `userEmail` to `indiafff568@gmail.com` to fake official recommendations.
3. **App Listing Hijack**: Non-admin user attempts to set `visibility: false` on critical security tools to suppress downloads.
4. **Massive ID Injection**: Sending a request to create a document with a 2MB hexadecimal string ID to overwhelm storage queries.
5. **Review Hijacking**: A contributor attempts to modify another user's review body or rating.
6. **Download Logs Scraping**: Anonymous or non-admin user attempts to query/list all individual `downloads` items, exposing user location data (PII).
7. **Negative Downloads Counter**: Injecting negative integer total downloads to break bento-statistics.
8. **Malicious URL Spoofing**: Injecting javascript URI or unverified APK link in the application mirror urls.
9. **Fake Email Verification**: Authenticated user with unverified email attempts to write system reviews.
10. **Timestamp Backdating**: Forcing `createdAt` to 10 years in the past to circumvent chronological filters.
11. **Shadow Field Injection**: Creating an app document with unmapped fields like `__developerToken` to leak internal config.
12. **System Config Poisoning**: Non-admin updating system settings or administrative definitions.

## 3. Threat Assessment Matrix

| Vector ID | Vector Name | Target Collection | Primary Defender Rule | Status |
|---|---|---|---|---|
| TS-01 | Self-Assigned Admin | `/users/{userId}` | `incoming().isAdmin == false || emailMatchesBootstrapped()` | Secure |
| TS-02 | Review Spoofing | `/apps/{appId}/reviews` | `incoming().userEmail == request.auth.token.email` | Secure |
| TS-03 | Bulk Log Harvesting | `/downloads` | `allow list: if false` (Admins only) | Secure |
| TS-04 | App State Shortcutting | `/apps` | `allow write: if isAdmin()` | Secure |
