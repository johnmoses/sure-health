from marshmallow import Schema, fields


class DailyCountSchema(Schema):
    date = fields.Date(required=True)
    count = fields.Int(required=True)


class AppointmentClinicianSchema(Schema):
    clinician_id = fields.Int(required=True)
    count = fields.Int(required=True)


class PrescriptionTypeSchema(Schema):
    type = fields.Str(required=True)
    count = fields.Int(required=True)


class WeeklyLoginTrendSchema(Schema):
    week = fields.Str(required=True)
    count = fields.Int(required=True)


class AdvancedAnalyticsSchema(Schema):
    new_users_daily = fields.List(fields.Nested(DailyCountSchema), required=True)
    appointments_per_clinician = fields.List(fields.Nested(AppointmentClinicianSchema), required=True)
    prescriptions_by_type = fields.List(fields.Nested(PrescriptionTypeSchema), required=True)
    chat_sessions_daily = fields.List(fields.Nested(DailyCountSchema), required=True)
    video_avg_session_duration_sec = fields.Float(required=True)
    weekly_login_trend = fields.List(fields.Nested(WeeklyLoginTrendSchema), required=True)
