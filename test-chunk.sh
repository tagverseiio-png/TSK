TOKEN=$(curl -s -X POST https://tskapi.t4gverse.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@tsk.com","password":"tsk@admin2024"}' | jq -r .token)
echo "Got token: ${TOKEN:0:10}..."

dd if=/dev/urandom of=test_tiny.bin bs=1K count=1 2>/dev/null
UPLOAD_ID="test-$(date +%s)"

echo "Uploading chunk..."
curl -s -X POST -F "uploadId=${UPLOAD_ID}" -F "chunkIndex=0" -F "totalChunks=1" -F "originalName=test.bin" -F "fileSize=1024" -F "mimeType=application/octet-stream" -F "chunk=@test_tiny.bin" https://tskapi.t4gverse.com/api/works/upload-chunk -H "Authorization: Bearer $TOKEN"

echo -e "\nAssembling chunks..."
curl -s -X POST https://tskapi.t4gverse.com/api/works/assemble-chunks -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"uploadId\":\"${UPLOAD_ID}\",\"originalName\":\"test.bin\",\"totalChunks\":1,\"mimeType\":\"application/octet-stream\"}"
