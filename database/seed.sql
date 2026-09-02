insert into app_connections (
  id,
  app_name,
  repository_url,
  status,
  contract_version,
  last_sync_at,
  health_check_url,
  health_check_status
) values
  ('app_platform_admin', 'Platform Admin', 'github.com/karukimori-wq/Platform-Admin', 'healthy', '0.1.0', '2026-08-26 00:00:00+09', 'https://platform-admin.karukimori.workers.dev/health', '200 OK'),
  ('app_growth_engine', 'Growth Engine', 'github.com/karukimori-wq/growth-engine', 'healthy', '0.1.0', '2026-08-31 00:00:00+09', 'https://growth-engine.karukimori.workers.dev/health', '200 OK'),
  ('app_professional_studio', 'Professional Studio', 'github.com/karukimori-wq/numeria-studio', 'healthy', '0.1.0', '2026-08-26 00:00:00+09', 'https://numeria-studio.illusionddt.chatgpt.site/health', '200 OK'),
  ('app_velvet', 'Velvet', 'github.com/karukimori-wq/Velvet', 'degraded', '0.1.0', '2026-08-26 00:00:00+09', null, 'skipped: VELVET_BASE_URL_NOT_CONFIGURED'),
  ('app_sns_planner', 'SNS Planner', 'github.com/karukimori-wq/sns-planner', 'healthy', '0.1.0', '2026-08-26 00:00:00+09', 'https://sns-planner.illusionddt.chatgpt.site/health', '200 OK'),
  ('app_communication_planner', 'Communication Planner', 'github.com/karukimori-wq/communication-planner', 'healthy', '0.1.0', '2026-08-26 00:00:00+09', 'https://communication-planner.karukimori.workers.dev/health', '200 OK'),
  ('app_ai_platform_core', 'AI Platform Core', 'github.com/karukimori-wq/ai-platform-core', 'healthy', '0.1.0', '2026-08-26 00:00:00+09', 'https://ai-platform-core.karukimori.workers.dev/health', '200 OK')
on conflict (id) do update set
  app_name = excluded.app_name,
  repository_url = excluded.repository_url,
  status = excluded.status,
  contract_version = excluded.contract_version,
  last_sync_at = excluded.last_sync_at,
  health_check_url = excluded.health_check_url,
  health_check_status = excluded.health_check_status,
  updated_at = now();

insert into workspace_summaries (
  workspace_id,
  owner_user_id,
  plan,
  stripe_status,
  public_site_status,
  enabled_apps
) values
  ('wks_numeria_001', 'user_owner_001', 'Business', 'connected', 'published', array['Platform Admin', 'Growth Engine', 'Professional Studio', 'SNS Planner', 'Communication Planner', 'AI Platform Core']),
  ('wks_trial_002', 'user_owner_002', 'Free', 'pending', 'draft', array['Growth Engine', 'Professional Studio']),
  ('wks_pro_003', 'user_owner_003', 'Pro', 'error', 'disabled', array['Growth Engine', 'AI Platform Core'])
on conflict (workspace_id) do update set
  owner_user_id = excluded.owner_user_id,
  plan = excluded.plan,
  stripe_status = excluded.stripe_status,
  public_site_status = excluded.public_site_status,
  enabled_apps = excluded.enabled_apps,
  updated_at = now();

insert into contract_documents (path) values
  ('docs/contracts/shared-glossary.md'),
  ('docs/contracts/platform-boundaries.md'),
  ('docs/contracts/app-responsibilities.md'),
  ('docs/repositories/platform-admin.md'),
  ('docs/contracts/api-catalog.md'),
  ('docs/contracts/event-catalog.md'),
  ('docs/contracts/event-flow.md'),
  ('docs/contracts/identity-contract.md'),
  ('docs/contracts/data-ownership.md'),
  ('docs/contracts/observability-contract.md'),
  ('docs/repositories/communication-planner.md'),
  ('docs/plan-release-monitoring.md')
on conflict (path) do update set checked_at = now();

insert into official_events (event_name, publisher_app) values
  ('growth.customer.created.v1', 'Growth Engine'),
  ('growth.customer.updated.v1', 'Growth Engine'),
  ('growth.lead.converted.v1', 'Growth Engine'),
  ('growth.reservation.created.v1', 'Growth Engine'),
  ('growth.reservation.cancelled.v1', 'Growth Engine'),
  ('studio.session.started.v1', 'Professional Studio'),
  ('studio.session.completed.v1', 'Professional Studio'),
  ('studio.report.generated.v1', 'Professional Studio'),
  ('studio.service_reference.updated.v1', 'Professional Studio'),
  ('velvet.visit.started.v1', 'Velvet'),
  ('velvet.visit.completed.v1', 'Velvet'),
  ('velvet.memory.updated.v1', 'Velvet'),
  ('velvet.note.created.v1', 'Velvet'),
  ('velvet.next_action.created.v1', 'Velvet'),
  ('communication.message.received.v1', 'Communication Planner'),
  ('communication.message.sent.v1', 'Communication Planner'),
  ('communication.context.updated.v1', 'Communication Planner'),
  ('communication.promise.created.v1', 'Communication Planner'),
  ('communication.next_action.created.v1', 'Communication Planner'),
  ('communication.reply_draft.created.v1', 'Communication Planner'),
  ('communication.reply_safety.checked.v1', 'Communication Planner'),
  ('communication.person_channel.linked.v1', 'Communication Planner'),
  ('sns.post_draft.created.v1', 'SNS Planner'),
  ('sns.post_draft.updated.v1', 'SNS Planner'),
  ('sns.message_draft.created.v1', 'SNS Planner'),
  ('sns.message_draft.updated.v1', 'SNS Planner'),
  ('ai.activity.created.v1', 'AI Platform Core'),
  ('ai.activity.completed.v1', 'AI Platform Core'),
  ('ai.activity.failed.v1', 'AI Platform Core'),
  ('ai.usage.recorded.v1', 'AI Platform Core')
on conflict (event_name) do update set
  publisher_app = excluded.publisher_app,
  checked_at = now();