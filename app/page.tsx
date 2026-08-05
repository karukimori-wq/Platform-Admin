import { Activity, Boxes, CheckCircle2, FileCheck2, Globe2, Layers3, PlugZap, ReceiptText, Search, UsersRound } from "lucide-react";
import {
  appConnections,
  contractDocuments,
  contractStatuses,
  dashboardMetrics,
  integrationLogs,
  officialEvents,
  responsibilities,
  workspaces
} from "@/lib/mock-data";
import type { AppStatus, ContractStatusValue, LogStatus } from "@/lib/types";

const appStatusLabel: Record<AppStatus, string> = { healthy: "正常", degraded: "注意", offline: "停止" };
const contractStatusLabel: Record<ContractStatusValue, string> = { compliant: "準拠", warning: "確認", mismatch: "不整合" };
const logStatusLabel: Record<LogStatus, string> = { success: "成功", warning: "注意", failed: "失敗" };

export default function Home() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">PA</div>
          <div>
            <p>Professional Studio</p>
            <h1>Platform Admin</h1>
          </div>
        </div>
        <nav className="nav">
          <a href="#dashboard"><Layers3 size={18} />Dashboard</a>
          <a href="#apps"><Boxes size={18} />Apps</a>
          <a href="#workspaces"><UsersRound size={18} />Workspaces</a>
          <a href="#logs"><Activity size={18} />Logs</a>
          <a href="#contracts"><FileCheck2 size={18} />Contracts</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operator Console</p>
            <h2>複数アプリの接続・契約・ログを一元確認</h2>
          </div>
          <div className="searchBox"><Search size={16} /><span>workspaceId / appName / event を検索</span></div>
        </header>

        <section id="dashboard" className="section">
          <div className="sectionHeader">
            <div><p className="eyebrow">Dashboard</p><h3>全体状態</h3></div>
            <span className="syncBadge">last sync 2026-08-05 21:40 JST</span>
          </div>
          <div className="metrics">
            {dashboardMetrics.map((metric) => (
              <article className="metricCard" key={metric.label}>
                <metric.icon size={20} />
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
                <span>{metric.helper}</span>
              </article>
            ))}
          </div>
          <div className="appGrid">
            {appConnections.map((app) => (
              <article className="appCard" key={app.id}>
                <div className="cardTop">
                  <div><h4>{app.appName}</h4><p>{app.repositoryUrl}</p></div>
                  <StatusPill status={app.status} label={appStatusLabel[app.status]} />
                </div>
                <div className="appMeta"><span>contract {app.contractVersion}</span><span>{app.healthCheckStatus}</span><span>{app.lastSyncAt}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section id="apps" className="section">
          <SectionTitle eyebrow="Apps" title="管理対象アプリ" />
          <div className="tableWrap">
            <table>
              <thead><tr><th>appName</th><th>repositoryUrl</th><th>status</th><th>contractVersion</th><th>lastSyncAt</th><th>healthCheckStatus</th></tr></thead>
              <tbody>
                {appConnections.map((app) => (
                  <tr key={app.id}><td>{app.appName}</td><td>{app.repositoryUrl}</td><td><StatusPill status={app.status} label={appStatusLabel[app.status]} /></td><td>{app.contractVersion}</td><td>{app.lastSyncAt}</td><td>{app.healthCheckStatus}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="workspaces" className="section">
          <SectionTitle eyebrow="Workspaces" title="workspace と外部連携" />
          <div className="workspaceGrid">
            {workspaces.map((workspace) => (
              <article className="workspaceCard" key={workspace.workspaceId}>
                <div className="cardTop">
                  <div><h4>{workspace.workspaceId}</h4><p>ownerUserId: {workspace.ownerUserId}</p></div>
                  <span className="planBadge">{workspace.plan}</span>
                </div>
                <div className="healthRows">
                  <HealthRow icon={ReceiptText} label="Stripe" value={workspace.stripeStatus} />
                  <HealthRow icon={Globe2} label="Public Site" value={workspace.publicSiteStatus} />
                  <HealthRow icon={PlugZap} label="Apps" value={workspace.enabledApps.join(", ")} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="logs" className="section">
          <SectionTitle eyebrow="Logs" title="連携・イベント・エラー" />
          <div className="logList">
            {integrationLogs.map((log) => (
              <article className="logItem" key={log.id}>
                <div><span className="logType">{log.type}</span><h4>{log.message}</h4><p>{log.workspaceId} / {log.appName} / {log.payloadRef}</p></div>
                <div className="logRight"><StatusPill status={log.status} label={logStatusLabel[log.status]} /><time>{log.createdAt}</time></div>
              </article>
            ))}
          </div>
        </section>

        <section id="contracts" className="section">
          <div className="sectionHeader">
            <div><p className="eyebrow">Contracts</p><h3>契約バージョンと準拠状態</h3></div>
            <span className="syncBadge">professional-platform-contracts</span>
          </div>
          <div className="contractLayout">
            <div className="tableWrap">
              <table>
                <thead><tr><th>appName</th><th>required</th><th>current</th><th>status</th><th>issues</th></tr></thead>
                <tbody>
                  {contractStatuses.map((contract) => (
                    <tr key={contract.id}><td>{contract.appName}</td><td>{contract.requiredContractVersion}</td><td>{contract.currentContractVersion}</td><td><ContractPill status={contract.status} label={contractStatusLabel[contract.status]} /></td><td>{contract.issues.length ? contract.issues.join(", ") : "なし"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="docPanel">
              <h4>必須ドキュメント</h4>
              {contractDocuments.map((path) => <div className="docRow" key={path}><CheckCircle2 size={16} /><span>{path}</span></div>)}
              <h4>責務分担</h4>
              <div className="eventList">
                {responsibilities.map((responsibility) => (
                  <span key={responsibility.area}>{responsibility.area}: {responsibility.canonicalOwner}</span>
                ))}
              </div>
              <h4>正式イベント名</h4>
              <div className="eventList">{officialEvents.map((event) => <span key={event}>{event}</span>)}</div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="sectionHeader"><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div></div>;
}

function StatusPill({ status, label }: { status: AppStatus | LogStatus; label: string }) {
  return <span className={`pill ${status}`}>{label}</span>;
}

function ContractPill({ status, label }: { status: ContractStatusValue; label: string }) {
  return <span className={`pill ${status}`}>{label}</span>;
}

function HealthRow({ icon: Icon, label, value }: { icon: typeof ReceiptText; label: string; value: string }) {
  return <div className="healthRow"><Icon size={16} /><span>{label}</span><strong>{value}</strong></div>;
}
