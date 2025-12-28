import pool from "../db";

// Dashboard statistics
export interface DashboardStats {
  total_users: number;
  total_vehicles: number;
  total_licenses: number;
  total_challans: number;
  pending_applications: number;
  total_revenue: number;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const usersResult = await pool.query("SELECT COUNT(*) as count FROM users");
  const vehiclesResult = await pool.query("SELECT COUNT(*) as count FROM vehicles");
  const licensesResult = await pool.query("SELECT COUNT(*) as count FROM driving_licenses");
  const challansResult = await pool.query("SELECT COUNT(*) as count FROM challans");
  const pendingResult = await pool.query(
    "SELECT COUNT(*) as count FROM dl_applications WHERE status IN ('PENDING', 'DOCUMENT_VERIFIED', 'TEST_SCHEDULED')"
  );
  const revenueResult = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'SUCCESS'"
  );

  return {
    total_users: parseInt(usersResult.rows[0].count),
    total_vehicles: parseInt(vehiclesResult.rows[0].count),
    total_licenses: parseInt(licensesResult.rows[0].count),
    total_challans: parseInt(challansResult.rows[0].count),
    pending_applications: parseInt(pendingResult.rows[0].count),
    total_revenue: parseFloat(revenueResult.rows[0].total),
  };
};

// Revenue analytics
export interface RevenueReport {
  period: string;
  challan_revenue: number;
  dl_revenue: number;
  vehicle_revenue: number;
  total_revenue: number;
}

// Get revenue analytics (by month)
export const getRevenueAnalytics = async (startDate?: string, endDate?: string): Promise<RevenueReport[]> => {
  let dateFilter = "WHERE status = 'SUCCESS' AND paid_at IS NOT NULL";
  const values: string[] = [];

  if (startDate && endDate) {
    dateFilter += " AND paid_at >= $1 AND paid_at <= $2";
    values.push(startDate, endDate);
  }

  const query = `
    SELECT 
      TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') as period,
      COALESCE(SUM(CASE WHEN payment_type = 'CHALLAN' THEN amount ELSE 0 END), 0) as challan_revenue,
      COALESCE(SUM(CASE WHEN payment_type = 'DL_APPLICATION' THEN amount ELSE 0 END), 0) as dl_revenue,
      COALESCE(SUM(CASE WHEN payment_type = 'VEHICLE_REGISTRATION' THEN amount ELSE 0 END), 0) as vehicle_revenue,
      COALESCE(SUM(amount), 0) as total_revenue
    FROM payments 
    ${dateFilter}
    GROUP BY DATE_TRUNC('month', paid_at)
    ORDER BY period DESC
    LIMIT 12
  `;

  const result = await pool.query(query, values);
  return result.rows.map((row) => ({
    period: row.period,
    challan_revenue: parseFloat(row.challan_revenue),
    dl_revenue: parseFloat(row.dl_revenue),
    vehicle_revenue: parseFloat(row.vehicle_revenue),
    total_revenue: parseFloat(row.total_revenue),
  }));
};

// Violations analytics
export interface ViolationStats {
  violation_type: string;
  count: number;
  total_amount: number;
  paid_count: number;
  unpaid_count: number;
}

// Get violation statistics
export const getViolationAnalytics = async (): Promise<ViolationStats[]> => {
  const query = `
    SELECT 
      violation_type,
      COUNT(*) as count,
      COALESCE(SUM(amount), 0) as total_amount,
      COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
      COUNT(CASE WHEN status IN ('UNPAID', 'DISPUTED') THEN 1 END) as unpaid_count
    FROM challans
    GROUP BY violation_type
    ORDER BY count DESC
  `;

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    violation_type: row.violation_type,
    count: parseInt(row.count),
    total_amount: parseFloat(row.total_amount),
    paid_count: parseInt(row.paid_count),
    unpaid_count: parseInt(row.unpaid_count),
  }));
};

// Risk assessment (ML placeholder)
export interface RiskAssessment {
  user_id: string;
  risk_score: number;
  total_challans: number;
  unpaid_challans: number;
  total_violations: number;
  risk_level: string;
}

// Get risk assessment for users with violations
export const getRiskAssessment = async (limit: number = 20): Promise<RiskAssessment[]> => {
  const query = `
    SELECT 
      v.owner_id as user_id,
      COUNT(c.id) as total_challans,
      COUNT(CASE WHEN c.status IN ('UNPAID', 'DISPUTED') THEN 1 END) as unpaid_challans,
      COALESCE(SUM(c.amount), 0) as total_violations
    FROM vehicles v
    LEFT JOIN challans c ON c.vehicle_id = v.id
    GROUP BY v.owner_id
    HAVING COUNT(c.id) > 0
    ORDER BY COUNT(CASE WHEN c.status IN ('UNPAID', 'DISPUTED') THEN 1 END) DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  
  return result.rows.map((row) => {
    const totalChallans = parseInt(row.total_challans);
    const unpaidChallans = parseInt(row.unpaid_challans);
    const riskScore = Math.min(100, (unpaidChallans / Math.max(1, totalChallans)) * 100 + unpaidChallans * 10);
    
    let riskLevel = "LOW";
    if (riskScore > 70) riskLevel = "HIGH";
    else if (riskScore > 40) riskLevel = "MEDIUM";

    return {
      user_id: row.user_id,
      risk_score: Math.round(riskScore),
      total_challans: totalChallans,
      unpaid_challans: unpaidChallans,
      total_violations: parseFloat(row.total_violations),
      risk_level: riskLevel,
    };
  });
};
