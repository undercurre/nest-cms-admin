import { getOSSSignature } from "@/api/modules/innp";
import { ElMessage, type UploadFile, type UploadUserFile } from "element-plus";
import { ref } from "vue";

export function useOssUpload({
  accept = [],
  acceptError,
  maxSize = 0,
  isMultiple = false
}: {
  accept?: string[];
  acceptError?: string;
  maxSize?: number;
  isMultiple?: boolean;
}) {
  const uploadLoading = ref(false);
  const uploadFileList = ref<UploadUserFile[]>([]);
  const setUploadLoading = (value: boolean) => {
    uploadLoading.value = value;
  };
  const setUploadFileList = (value: UploadUserFile[]) => {
    uploadFileList.value = value;
  };
  const handleFileChange = async (file: UploadFile): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (accept.length) {
        const isImg = accept?.includes(file?.raw?.type ?? "");
        if (!isImg) {
          setUploadFileList([]);
          return ElMessage.error(acceptError);
        }
      }
      if (maxSize) {
        const isLt5M = (file?.size ?? 0) < maxSize * 1024 * 1024;
        if (!isLt5M) {
          setUploadFileList([]);
          return ElMessage.error(`文件大小不能超过 ${maxSize}MB!`);
        }
      }
      const signatureRes = await getOSSSignature({
        headerContentType: file?.raw?.type ?? "",
        fileType: file?.raw?.type?.split("/")?.[1] ?? ""
      });
      setUploadLoading(true);
      try {
        if (!isMultiple) {
          ElMessage.info({
            message: "文件上传中，请稍等...",
            duration: 1500
          });
        }
        // 确保window.location.protocol结尾有冒号（有些浏览器可能没有）
        const currentProtocol = window.location.protocol.endsWith(":")
          ? window.location.protocol
          : window.location.protocol + ":";

        // 替换http:或https:为当前协议
        const signatureUrl = signatureRes?.data?.url?.replace(/^https?:/, currentProtocol);
        const res = await fetch(signatureUrl ?? "", {
          method: "PUT",
          body: file.raw
        });
        setUploadLoading(false);
        if (res.status === 200) {
          resolve(signatureUrl?.split("?")?.[0] ?? "");
          if (!isMultiple) {
            ElMessage.success("文件上传成功");
          }
        } else {
          ElMessage.error("文件上传失败");
          reject("文件上传失败");
        }
      } catch (error) {
        setUploadLoading(false);
        ElMessage.error("文件上传失败");
        reject("文件上传失败");
      }
    });
  };
  return {
    uploadLoading,
    setUploadLoading,
    uploadFileList,
    setUploadFileList,
    handleFileChange
  };
}
