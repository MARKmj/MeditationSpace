import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogIn } from "lucide-react";

export default function LoginPlaceholder() {
  return (
    <Card className="max-w-md mx-auto p-6 text-center">
      <div className="space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">登录功能暂时不可用</h3>
          <p className="text-sm text-muted-foreground mb-4">
            开发环境需要配置 OAuth 服务才能使用登录功能。
            您可以继续使用基本的冥想功能。
          </p>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>要启用登录功能，请配置以下环境变量：</p>
          <div className="bg-muted p-2 rounded text-left font-mono">
            <div>VITE_APP_ID=your-app-id</div>
            <div>VITE_OAUTH_PORTAL_URL=...</div>
          </div>
        </div>
        <Button variant="outline" disabled className="w-full">
          <LogIn className="w-4 h-4 mr-2" />
          登录功能开发中
        </Button>
      </div>
    </Card>
  );
}