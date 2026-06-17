"""Compatibility shim: patches SQLModel 0.0.38 for SQLAlchemy 2.x Mapped types.

SQLModel 0.0.38 does not handle ``Mapped[ForwardRef(...)]`` annotations that
SQLAlchemy 2.x injects into relationship attributes of base classes.  This
crashes ``get_column_from_field`` when a child class inherits from a parent
that has already been instrumented.

The patch skips fields whose annotation origin is ``Mapped`` — they are
relationship descriptors and should not be converted to ``Column`` objects.
"""
from typing import get_origin

import sqlmodel.main as _sm

_original_get_column_from_field = _sm.get_column_from_field


def _compat_get_column_from_field(field):
    from sqlalchemy.orm.base import Mapped
    if hasattr(field, "annotation"):
        origin = get_origin(field.annotation)
        if origin is Mapped:
            return _sm.Column()
    return _original_get_column_from_field(field)


_sm.get_column_from_field = _compat_get_column_from_field
