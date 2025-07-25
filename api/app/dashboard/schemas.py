from marshmallow import Schema, fields

class MetricSchema(Schema):
    metric_name = fields.Str(required=True)
    value = fields.Float(required=True)
    timestamp = fields.DateTime(dump_only=True)
    dimension_key = fields.Str(allow_none=True)
    dimension_value = fields.Str(allow_none=True)

class UserActivitySchema(Schema):
    user_id = fields.Int(allow_none=True)
    activity_type = fields.Str(required=True)
    timestamp = fields.DateTime(dump_only=True)
    details = fields.Str(allow_none=True)

# Schema for aggregated data (e.g., daily active users)
class AggregatedDataSchema(Schema):
    label = fields.Str(required=True) # e.g., date, hour, user_id
    value = fields.Float(required=True)
