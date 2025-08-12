from marshmallow import Schema, fields

class LLMQuerySchema(Schema):
    messages = fields.List(
        fields.Dict(keys=fields.Str(), values=fields.Str()),
        required=True,
        description="List of chat messages in OpenAI format (role, content)"
    )
    max_tokens = fields.Int(missing=512)
    temperature = fields.Float(missing=0.7)
    top_p = fields.Float(missing=0.9)
    stop_tokens = fields.List(fields.Str(), missing=None)
    stream = fields.Bool(missing=False)
