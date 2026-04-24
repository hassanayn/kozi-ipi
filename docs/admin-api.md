# Admin API

Kozi Ipi does not require public user authentication. Public visitors can search and submit corrections without accounts.

Admin/moderation access is protected with a server-side Convex environment variable:

```text
ADMIN_API_KEY
```

The key is stored locally in `.env.admin.local`, which is ignored by Git. Do not commit it.

## Configure Key

Set the key on the Convex dev deployment:

```sh
source .env.admin.local
bunx convex env set ADMIN_API_KEY "$ADMIN_API_KEY"
```

Set the key on the Convex production deployment:

```sh
source .env.admin.local
bunx convex env set --prod ADMIN_API_KEY "$ADMIN_API_KEY"
```

## List Corrections

Dev:

```sh
source .env.admin.local
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  "https://first-mammoth-782.convex.site/admin/corrections?status=pending&limit=50"
```

Production:

```sh
source .env.admin.local
curl -H "Authorization: Bearer $ADMIN_API_KEY" \
  "https://beaming-dragon-615.convex.site/admin/corrections?status=pending&limit=50"
```

Supported statuses:

```text
pending
approved
rejected
needs_more_info
```

## Update Correction Status

Dev:

```sh
source .env.admin.local
curl -X POST \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d '{"id":"CORRECTION_ID","status":"approved"}' \
  https://first-mammoth-782.convex.site/admin/corrections/status
```

Production:

```sh
source .env.admin.local
curl -X POST \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "content-type: application/json" \
  -d '{"id":"CORRECTION_ID","status":"approved"}' \
  https://beaming-dragon-615.convex.site/admin/corrections/status
```

