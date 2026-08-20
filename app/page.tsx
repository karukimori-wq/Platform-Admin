"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Boxes, CheckCircle2, CircleDot, FileCheck2, Globe2, Layers3, PlugZap, ReceiptText, RefreshCw, Search, UsersRound } from "lucide-react";
import type {
  AppConnection,
  AppStatus,
  ConnectionTestLog,
  ConnectionTestResult,
  ContractStatus,
  ContractStatusValue,
  DashboardMetric,
  IntegrationLog,
  LogStatus,
  Responsibility,
  SystemStatus,
  WorkspaceSummary
} from "@/lib/types";

const appStatusLabel: Record<AppStatus, string> = { healthy: "正常", degraded: "注意", offline: "停止" };
const contractStatusLabel: Record<ContractStatusValue, string> = { compliant: "準拠", warning: "確認", mismatch: "不整合" };
const logStatusLabel: Record<LogStatus, string> = { success: "成功", warning: "注意", failed: "失敗" };

type ContractsPayload = { data: { statuses: ContractStatus[]; documents: string[]; officialEvents: string[]; responsibilities: Responsibility[] } };
type ConnectionPayload = { data: ConnectionTestResult[]; logs: ConnectionTestLog[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDataArray<T>(payload: unknown, label: string): T[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) throw new Error(`${label} payload is invalid`);
  return payload.data as T[];
}

function readDataObject<T>(payload: unknown, label: string): T {
  if (!isRecord(payload) || !isRecord(payload.data)) throw new Error(`${label} payload is invalid`);
  return payload.data as T;
}

function readContractsPayload(payload: unknown): ContractsPayload {
  if (!isRecord(payload) || !isRecord(payload.data)) throw new Error("Contracts payload is invalid");
  const data = payload.data;
  if (!Array.isArray(data.statuses) || !Array.isArray(data.documents) || !Array.isArray(data.officialEvents) || !Array.isArray(data.responsibilities)) {
    throw new Error("Contracts payload is invalid");
  }
  return payload as unknown as ContractsPayload;
}

function readConnectionPayload(payload: unknown): ConnectionPayload {
  if (!isRecord(payload) || !Array.isArray(payload.data) || !Array.isArray(payload.logs)) {
    throw new Error("Connection test payload is invalid");
  }
  return payload as unknown as ConnectionPayload;
}

export default function Home() {
  const [appConnections, setAppConnections] = useState<AppConnection[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [contractStatuses, setContractStatuses] = useState<ContractStatus[]>([]);
  const [contractDocuments, setContractDocuments] = useState<string[]>([]);
  const [officialEvents, setOfficialEvents] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [connectionTests, setConnectionTests] = useState<ConnectionTestResult[]>([]);
  const [connectionLogs, setConnectionLogs] = useState<ConnectionTestLog[]>([]);
  const [isCheckingConnections, setIsCheckingConnections] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSnapshots() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const responses = await Promise.all([
          fetch("/api/apps"), fetch("/api/workspaces"), fetch("/api/logs"), fetch("/api/contracts"), fetch("/api/status"), fetch("/api/connection-tests")
        ]);
        if (responses.some((response) => !response.ok)) throw new Error("Platform Admin API snapshot could not be loaded");
        const payloads = await Promise.all(responses.map((response) => response.json()));
        if (!isMounted) return;
        const contracts = readContractsPayload(payloads[3]);
        const connections = readConnectionPayload(payloads[5]);
        setAppConnections(readDataArray<AppConnection>(payloads[0], "Apps"));
        setWorkspaces(readDataArray<WorkspaceSummary>(payloads[1], "Workspaces"));
        setIntegrationLogs(readDataArray<IntegrationLog>(payloads[2], "Logs"));
        setContractStatuses(contracts.data.statuses);
        setContractDocuments(contracts.data.documents);
        setOfficialEvents(contracts.data.officialEvents);
        setResponsibilities(contracts.data.responsibilities);
        setSystemStatus(readDataObject<SystemStatus>(payloads[4], "Status"));
        setConnectionTests(connections.data);
        setConnectionLogs(connections.logs);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Unknown loading error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSnapshots();
    return () => { isMounted = false; };
  }, []);

  async function runConnectionTest() {
    try {
      setIsCheckingConnections(true);
      setLoadError(null);
      const response = await fetch("/api/connection-tests");
      if (!response.ok) throw new Error("Connection test API could not be loaded");
      const payload = readConnectionPayload(await response.json());
      setConnectionTests(payload.data);
      setConnectionLogs(payload.logs);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unknown connection test error");
    } finally {
      setIsCheckingConnections(false);
    }
  }

  const dashboardMetrics: DashboardMetric[] = useMemo(() => {
    const compliantContracts = contractStatuses.filter((contract) => contract.status === "compliant").length;
    const pendingEvents = integrationLogs.filter((log) => log.status === "warning").length;
    const errors = integrationLogs.filter((log) => log.status === "failed").length;
    return [
      { label: "管理アプリ", value: String(appConnections.length), helper: "apps monitored by API", icon: Boxes },
      { label: "準拠契約", value: `${compliantContracts}/${contractStatuses.length}`, helper: "contract snapshot", icon: FileCheck2 },
      { label: "未処理イベント", value: String(pendingEvents), helper: "warning logs", icon: CircleDot },
      { label: "エラー", value: String(errors), helper: "failed logs", icon: AlertTriangle }
    ];
  }, [appConnections.length, contractStatuses, integrationLogs]);

  return (
    <main className="shell">
      <aside className="sidebar"><div className="brand"><div className="brandMark">PA</div><div><p>Professional Studio</p><h1>Platform Admin</h1></div></div><nav className="nav"><a href="#dashboard"><Layers3 size={18} />Dashboard</a><a href="#apps"><Boxes size={18} />Apps</a><a href="#connection-test"><PlugZap size={18} />Connection Test</a><a href="#workspaces"><UsersRound size={18} />Workspaces</a><a href="#logs"><Activity size={18} />Logs</a><a href="#contracts"><FileCheck2 size={18} />Contracts</a></nav></aside>
      <section className="content">
        <header className="topbar"><div><p className="eyebrow">Operator Console</p><h2>複数アプリの接続・契約・ログを一元確認</h2></div><div className="searchBox"><Search size={16} /><span>workspaceId / appName / event を検索</span></div></header>
        {loadError && <div className="errorBanner">{loadError}</div>}{isLoading && <div className="loadingBanner">APIスナップショットを読み込み中</div>}
        <section id="dashboard" className="section"><div className="sectionHeader"><div><p className="eyebrow">Dashboard</p><h3>全体状態</h3></div><span className="syncBadge">operational snapshot</span></div><div className="metrics">{dashboardMetrics.map((metric) => <article className="metricCard" key={metric.label}><metric.icon size={20} /><p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.helper}</span></article>)}</div><div className="appGrid">{appConnections.map((app) => <article className="appCard" key={app.id}><div className="cardTop"><div><h4>{app.appName}</h4><p>{app.repositoryUrl}</p></div><StatusPill status={app.status} label={appStatusLabel[app.status]} /></div><div className="appMeta"><span>contract {app.contractVersion}</span><span>{app.healthCheckStatus}</span><span>{app.lastSyncAt}</span></div></article>)}</div>{systemStatus && <div className="systemStatus"><div><span>Data Source</span><strong>{systemStatus.dataSource}</strong></div><div><span>Basic Auth</span><strong>{systemStatus.basicAuth}</strong></div><div><span>D1</span><strong>{systemStatus.database.d1Binding}</strong></div><div><span>Clerk</span><strong>{systemStatus.admin.clerk}</strong></div></div>}</section>
        <section id="apps" className="section"><SectionTitle eyebrow="Apps" title="管理対象アプリ" /><div className="tableWrap"><table><thead><tr><th>appName</th><th>repositoryUrl</th><th>status</th><th>contractVersion</th><th>lastSyncAt</th><th>healthCheckStatus</th></tr></thead><tbody>{appConnections.map((app) => <tr key={app.id}><td>{app.appName}</td><td>{app.repositoryUrl}</td><td><StatusPill status={app.status} label={appStatusLabel[app.status]} /></td><td>{app.contractVersion}</td><td>{app.lastSyncAt}</td><td>{app.healthCheckStatus}</td></tr>)}</tbody></table></div></section>
        <section id="connection-test" className="section"><div className="sectionHeader"><div><p className="eyebrow">Connection Test</p><h3>API接続テスト</h3></div><button className="actionButton" type="button" onClick={runConnectionTest} disabled={isCheckingConnections}><RefreshCw size={16} />{isCheckingConnections ? "確認中" : "再確認"}</button></div><div className="tableWrap"><table className="connectionTable"><thead><tr><th>appName</th><th>health</th><th>version</th><th>contract</th><th>issues</th></tr></thead><tbody>{connectionTests.map((result) => <tr key={result.appName}><td>{result.appName}</td><td><ConnectionPill ok={result.healthStatus === "200 OK"} label={result.healthStatus || "未確認"} /></td><td>{result.appVersion || "-"}</td><td>{result.contractVersion || "-"}</td><td>{result.issues.length ? result.issues.join(", ") : "なし"}</td></tr>)}</tbody></table></div></section>
        <section id="workspaces" className="section"><SectionTitle eyebrow="Workspaces" title="workspace と外部連携" /><div className="workspaceGrid">{workspaces.map((workspace) => <article className="workspaceCard" key={workspace.workspaceId}><div className="cardTop"><div><h4>{workspace.workspaceId}</h4><p>ownerUserId: {workspace.ownerUserId}</p></div><span className="planBadge">{workspace.plan}</span></div><div className="healthRows"><HealthRow icon={ReceiptText} label="Stripe" value={workspace.stripeStatus} /><HealthRow icon={Globe2} label="Public Site" value={workspace.publicSiteStatus} /><HealthRow icon={PlugZap} label="Apps" value={workspace.enabledApps.join(", ")} /></div></article>)}</div></section>
        <section id="logs" className="section"><SectionTitle eyebrow="Logs" title="連携・イベント・エラー" /><div className="logList">{integrationLogs.map((log) => <article className="logItem" key={log.id}><div><span className="logType">{log.type}</span><h4>{log.message}</h4><p>{log.workspaceId} / {log.appName} / {log.payloadRef}</p></div><div className="logRight"><StatusPill status={log.status} label={logStatusLabel[log.status]} /><time>{log.createdAt}</time></div></article>)}</div></section>
        <section id="contracts" className="section"><div className="sectionHeader"><div><p className="eyebrow">Contracts</p><h3>契約バージョンと準拠状態</h3></div><span className="syncBadge">professional-platform-contracts</span></div><div className="contractLayout"><div className="tableWrap"><table><thead><tr><th>appName</th><th>required</th><th>current</th><th>status</th><th>issues</th></tr></thead><tbody>{contractStatuses.map((contract) => <tr key={contract.id}><td>{contract.appName}</td><td>{contract.requiredContractVersion}</td><td>{contract.currentContractVersion}</td><td><ContractPill status={contract.status} label={contractStatusLabel[contract.status]} /></td><td>{contract.issues.length ? contract.issues.join(", ") : "なし"}</td></tr>)}</tbody></table></div><div className="docPanel"><h4>必須ドキュメント</h4>{contractDocuments.map((document) => <p key={document}>{document}</p>)}<h4>公式イベント</h4>{officialEvents.map((eventName) => <p key={eventName}>{eventName}</p>)}<h4>正本責務</h4>{responsibilities.map((responsibility) => <p key={responsibility.area}>{responsibility.area}: {responsibility.canonicalOwner}</p>)}</div></div></section>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) { return <div className="sectionHeader"><div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3></div></div>; }
function StatusPill({ status, label }: { status: AppStatus | LogStatus; label: string }) { return <span className={`statusPill ${status}`}>{status === "healthy" || status === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{label}</span>; }
function ContractPill({ status, label }: { status: ContractStatusValue; label: string }) { return <span className={`statusPill ${status}`}>{status === "compliant" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{label}</span>; }
function ConnectionPill({ ok, label }: { ok: boolean; label: string }) { return <span className={`statusPill ${ok ? "healthy" : "degraded"}`}>{ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{label}</span>; }
function HealthRow({ icon: Icon, label, value }: { icon: typeof ReceiptText; label: string; value: string }) { return <div className="healthRow"><Icon size={16} /><span>{label}</span><strong>{value}</strong></div>; }
