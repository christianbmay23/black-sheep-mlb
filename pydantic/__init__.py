from __future__ import annotations

from dataclasses import dataclass


class _Missing:
    pass


MISSING = _Missing()


@dataclass
class FieldInfo:
    default: object = MISSING
    ge: float | None = None
    gt: float | None = None
    le: float | None = None
    lt: float | None = None


def Field(default: object = MISSING, **kwargs) -> FieldInfo:
    return FieldInfo(default=default, **kwargs)


class BaseModel:
    def __init__(self, **data):
        anns = getattr(self.__class__, '__annotations__', {})
        for name in anns:
            declared = getattr(self.__class__, name, MISSING)
            if name in data:
                value = data[name]
            elif isinstance(declared, FieldInfo) and declared.default is not MISSING:
                value = declared.default
            elif declared is not MISSING and not isinstance(declared, FieldInfo):
                value = declared
            else:
                raise ValueError(f'Missing required field: {name}')
            if isinstance(declared, FieldInfo):
                self._validate_bounds(name, value, declared)
            setattr(self, name, value)

    @staticmethod
    def _validate_bounds(name: str, value, fi: FieldInfo):
        if isinstance(value, (int, float)):
            if fi.ge is not None and value < fi.ge:
                raise ValueError(f'{name} must be >= {fi.ge}')
            if fi.gt is not None and value <= fi.gt:
                raise ValueError(f'{name} must be > {fi.gt}')
            if fi.le is not None and value > fi.le:
                raise ValueError(f'{name} must be <= {fi.le}')
            if fi.lt is not None and value >= fi.lt:
                raise ValueError(f'{name} must be < {fi.lt}')

    def model_dump(self) -> dict:
        return {k: getattr(self, k) for k in self.__class__.__annotations__}
