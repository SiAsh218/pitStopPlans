const PREFERRED_ROLE_NAMES = [
  "SNDM",
  "RCM",
  "Train Running Controller",
  "Incident Controller",
  "Information Controller",
  "Infrastructure Controller",
];

const PREFERRED_ROLE_RANK = new Map(
  PREFERRED_ROLE_NAMES.map((name, index) => [name, index]),
);

function compareRoleNames(a, b) {
  const rankA = PREFERRED_ROLE_RANK.get(a) ?? PREFERRED_ROLE_NAMES.length;
  const rankB = PREFERRED_ROLE_RANK.get(b) ?? PREFERRED_ROLE_NAMES.length;

  return rankA - rankB || a.localeCompare(b);
}

function orderTemplateRoles(roles, savedRoleIds = []) {
  const roleById = new Map(roles.map((role) => [Number(role.id), role]));
  const savedIds = savedRoleIds
    .map(Number)
    .filter((roleId) => roleById.has(roleId));
  const savedIdSet = new Set(savedIds);
  const remainingRoles = roles
    .filter((role) => !savedIdSet.has(Number(role.id)))
    .sort((a, b) => compareRoleNames(a.name, b.name));

  return [
    ...new Set([
      ...savedIds,
      ...remainingRoles.map((role) => Number(role.id)),
    ]),
  ];
}

function persistTemplateRoleOrder(db, templateId, savedRoleIds) {
  const template = db
    .prepare("SELECT role_order FROM plan_templates WHERE id = ?")
    .get(templateId);
  const existingRoleOrder =
    savedRoleIds ??
    (template?.role_order ? JSON.parse(template.role_order) : []);
  const roles = db
    .prepare(
      `
        SELECT DISTINCT r.id, r.name
        FROM roles r
        INNER JOIN plan_stage_action_roles psar
          ON r.id = psar.role_id
        INNER JOIN plan_stage_actions psa
          ON psa.id = psar.plan_stage_action_id
        INNER JOIN plan_stages ps
          ON ps.id = psa.plan_stage_id
        WHERE ps.plan_template_id = ?
      `,
    )
    .all(templateId);
  const roleOrder = orderTemplateRoles(roles, existingRoleOrder);

  db.prepare("UPDATE plan_templates SET role_order = ? WHERE id = ?").run(
    JSON.stringify(roleOrder),
    templateId,
  );

  return roleOrder;
}

module.exports = {
  orderTemplateRoles,
  persistTemplateRoleOrder,
};
