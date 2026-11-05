<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>{{ $title }} – OneMate</title>
</head>
<body style="margin: 0; padding: 0; background-color: #18191b; color: #d7d7d7;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#18191b" style="width: 100%; background-color: #18191b; border-collapse: collapse; font-family: 'Trebuchet MS', Verdana, Arial, sans-serif;">
        <tr>
            <td align="center" style="padding: 32px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1e1f22" style="width: 100%; max-width: 560px; background-color: #1e1f22; border: 1px solid #39393a; border-radius: 24px; border-collapse: separate;">
                    <tr>
                        <td align="center" style="padding: 40px 28px 28px;">
                            <span style="font-size: 30px; font-weight: 700; letter-spacing: -1px; color: #d7d7d7;">One</span><span style="font-size: 30px; font-weight: 700; letter-spacing: -1px; color: #e98224;">Mate</span>
                        </td>
                    </tr>
                    <tr><td style="padding: 0 28px;"><div style="height: 1px; background-color: #39393a; font-size: 1px; line-height: 1px;">&nbsp;</div></td></tr>
                    <tr>
                        <td align="center" style="padding: 32px 28px 0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; line-height: 1.3; color: #e5e5e5;">{{ $title }}</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 16px 28px 0; font-size: 15px; line-height: 1.7; color: #a0a0a0; overflow-wrap: anywhere;">
                            @if ($overdue)
                                Задача «{{ $taskTitle }}» не завершена в срок.
                            @else
                                Напоминаем о сроке выполнения задачи «{{ $taskTitle }}».
                            @endif
                            <br />Доска: <strong style="color: #e5e5e5;">{{ $boardTitle }}</strong>.
							<br />Срок выполнения: <strong style="color: #e5e5e5;">{{ \Carbon\CarbonImmutable::parse($endDate)->format('d.m.Y') }}</strong>.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 28px 28px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#e98224" style="border-radius: 12px;">
                                <a href="{{ $url }}" target="_blank" style="display: inline-block; padding: 14px 28px; border-radius: 12px; background-color: #e98224; font-size: 14px; font-weight: 700; line-height: 1.4; color: #18191b; text-decoration: none;">Открыть Канбан</a>
                            </td></tr></table>
                        </td>
                    </tr>
                    <tr><td style="padding: 0 28px;"><div style="height: 1px; background-color: #39393a; font-size: 1px; line-height: 1px;">&nbsp;</div></td></tr>
                    <tr><td align="center" style="padding: 24px 28px 32px; font-size: 12px; line-height: 1.6; color: #858585;">© {{ date('Y') }} OneMate</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
