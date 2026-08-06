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

        const [appsResponse, workspacesResponse, logsResponse, contractsResponse, statusResponse, connectionResponse] = await Promise.all([
          fetch("/api/apps"),
          fetch("/api/workspaces"),
          fetch("/api/logs"),
          fetch("/api/contracts"),
          fetch("/api/status"),
          fetch("/api/connection-tests")
        ]);

        if (!appsResponse.ok || !workspacesResponse.ok || !logsResponse.ok || !contractsResponse.ok || !statusResponse.ok || !connectionResponse.ok) {
          throw new Error("Platform Admin API snapshot could not be loaded");
        }

        const [appsPayload, workspacesPayload, logsPayload, contractsPayload, statusPayload, connectionPayload] = await Promise.all([
          appsResponse.json(),
          workspacesResponse.json(),
          logsResponse.json(),
          contractsResponse.json(),
          statusResponse.json(),
          connectionResponse.json()
        ]);

        if (!isMounted) return;

        setAppConnections(appsPayload.data);
        setWorkspaces(workspacesPayload.data);
        setIntegrationLogs(logsPayload.data);
        setContractStatuses(contractsPayload.data.statuses);
        setContractDocuments(contractsPayload.data.documents);
        setOfficialEvents(contractsPayload.data.officialEvents);
        setResponsibilities(contractsPayload.data.responsibilities);
        setSystemStatus(statusPayload.data);
        setConnectionTests(connectionPayload.data);
        setConnectionLogs(connectionPayload.logs);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Unknown loading error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSnapshots();

    return () => {
      isMounted = false;
    };
  }, []);

  async function runConnectionTest() {
    try {
      setIsCheckingConnections(true);
      setLoadError(null);

      const response = await fetch("/api/connection-tests");
      if (!response.ok) throw new Error("Connection test API could not be loaded");

      const payload = await response.json();
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
          <a href="#connection-test"><PlugZap size={18} />Connection Test</a>
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

        {loadError && <div className="errorBanner">{loadError}</div>}
        {isLoading && <div className="loadingBanner">APIスナップショットを読み込み中</div>}

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
          {systemStatus && (
            <div className="systemStatus">
              <div><span>Data Source</span><strong>{systemStatus.dataSource}</strong></div>
              <div><span>Basic Auth</span><strong>{systemStatus.basicAuth}</strong></div>
              <div><span>Supabase URL</span><strong>{systemStatus.database.supabaseUrl}</strong></div>
              <div><span>Service Role</span><strong>{systemStatus.database.serviceRoleKey}</strong></div>
              <div><span>Admin User</span><strong>{systemStatus.admin.username}</strong></div>
              <div><span>API Token</span><strong>{systemStatus.admin.apiToken}</strong></div>
            </div>
          )}
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

        <section id="connection-test" className="section">
          <div className="sectionHeader">
            <div><p className="eyebrow">Connection Test</p><h3>API接続テスト</h3></div>
            <button className="actionButton" type="button" onClick={runConnectionTest} disabled={isCheckingConnections}>
              <RefreshCw size={16} />
              {isCheckingConnections ? "確認中" : "再確認"}
            </button>
          </div>
          <div className="tableWrap">
            <table className="connectionTable">
              <thead>
                <tr>
                  <th>appName</th>
                  <th>baseUrl</th>
                  <th>healthStatus</th>
                  <th>appVersion</th>
                  <th>contractVersion</th>
                  <th>contractStatus</th>
                  <th>issues</th>
                  <th>lastCheckedAt</th>
                  <th>lastError</th>
                </tr>
              </thead>
              <tbody>
                {connectionTests.map((result) => (
                  <tr key={result.appName}>
                    <td>{result.appName}</td>
                    <td>{result.baseUrl}</td>
                    <td><ConnectionPill ok={result.healthStatus === "200 OK"} label={result.healthStatus || "未確認"} /></td>
                    <td>{result.appVersion || "-"}</td>
                    <td>{result.contractVersion || "-"}</td>
                    <td><ConnectionPill ok={result.contractStatus === "ok"} label={result.contractStatus || "unknown"} /></td>
                    <td>{result.issues.length ? result.issues.join(", ") : "なし"}</td>
                    <td>{result.lastCheckedAt}</td>
                    <td>{result.lastError || "なし"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="contractCheckGrid">
            {connectionTests.map((result) => (
              <article className="checkCard" key={`${result.appName}-checks`}>
                <h4>{result.appName}</h4>
                <CheckLine label="identityMode" ok={result.identityMode === "workspaceId+userId"} value={result.identityMode || "-"} />
                <CheckLine label="professionalIdRequired" ok={result.professionalIdRequired === false} value={String(result.professionalIdRequired)} />
                <CheckLine label="usesLegacyEventNames" ok={result.usesLegacyEventNames === false} value={String(result.usesLegacyEventNames)} />
                <CheckLine label="usesReportTerminology" ok={result.usesReportTerminology === true} value={String(result.usesReportTerminology)} />
              </article>
            ))}
          </div>
          <div className="connectionLogs">
            <h4>失敗ログ</h4>
            {connectionLogs.length === 0 ? (
              <p>失敗ログはありません。</p>
            ) : (
              connectionLogs.map((log) => (
                <article className="connectionLogItem" key={`${log.appName}-${log.endpoint}-${log.checkedAt}`}>
                  <strong>{log.appName}</strong>
                  <span>{log.endpoint}</span>
                  <span>{log.statusCode ?? "no status"}</span>
                  <span>{log.errorMessage}</span>
                  <time>{log.checkedAt}</time>
                </article>
              ))
            )}
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

function ConnectionPill({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`pill ${ok ? "success" : "failed"}`}>{label}</span>;
}

function CheckLine({ label, ok, value }: { label: string; ok: boolean; value: string }) {
  return (
    <div className="checkLine">
      <span>{label}</span>
      <ConnectionPill ok={ok} label={value} />
    </div>
  );
}

function HealthRow({ icon: Icon, label, value }: { icon: typeof ReceiptText; label: string; value: string }) {
  return <div className="healthRow"><Icon size={16} /><span>{label}</span><strong>{value}</strong></div>;
}
